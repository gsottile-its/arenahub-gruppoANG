package com.arenahub.Service;

import com.arenahub.dto.request.RisultatoRequest;
import com.arenahub.dto.request.TabelloneRequest;
import com.arenahub.dto.response.PartiteResponse;
import com.arenahub.dto.response.RisultatoResponse;
import com.arenahub.dto.response.TabelloneResponse;
import com.arenahub.entity.Iscrizione;
import com.arenahub.entity.Partita;
import com.arenahub.entity.Torneo;
import com.arenahub.entity.enums.IscrizioneStato;
import com.arenahub.entity.enums.PartitaStato;
import com.arenahub.entity.enums.TorneoStato;
import com.arenahub.exception.ApiException;
import com.arenahub.repository.IscrizioneRepository;
import com.arenahub.repository.PartitaRepository;
import com.arenahub.repository.TorneoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class TabelloneService {

    private final TorneoRepository torneoRepository;
    private final IscrizioneRepository iscrizioneRepository;
    private final PartitaRepository partitaRepository;

    public TabelloneResponse genera(Long idTorneo, TabelloneRequest richiesta) {
        Torneo t = torneoRepository.findById(idTorneo)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Torneo non trovato"));
        if (partitaRepository.existsByTorneoId(idTorneo)) {
            throw new ApiException(HttpStatus.CONFLICT, "Il tabellone esiste già");
        }
        if (t.getStato() != TorneoStato.iscrizioni_chiuse) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Chiudi le iscrizioni prima di generare il tabellone");
        }

        List<Iscrizione> confermate = new ArrayList<>(
                iscrizioneRepository.findByTorneoIdAndStato(idTorneo, IscrizioneStato.confermata));
        int n = confermate.size();
        if (n < 2) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Servono almeno 2 partecipanti confermati");
        }
        Collections.shuffle(confermate);

        int size = 1;
        while (size < n) {
            size <<= 1;
        }
        int turni = Integer.numberOfTrailingZeros(size);

        // Il torneo nel DB non ha una data di inizio: se non arriva nella richiesta,
        // la data delle partite resta vuota (la colonna data_partita e' facoltativa).
        LocalDateTime base = richiesta == null ? null : richiesta.dataPartita();

        Map<Integer, List<Partita>> perTurno = new LinkedHashMap<>();
        for (int turno = 1; turno <= turni; turno++) {
            int quante = size >> turno;
            List<Partita> lista = new ArrayList<>();
            for (int pos = 0; pos < quante; pos++) {
                Partita p = new Partita();
                p.setTorneo(t);
                p.setTurno(turno);
                p.setStato(PartitaStato.programmata);
                p.setDataPartita(base == null ? null : base.plusMinutes(90L * (turno - 1)));
                lista.add(p);
            }
            perTurno.put(turno, lista);
        }

        int bye = size - n;
        Iterator<Iscrizione> it = confermate.iterator();
        List<Partita> primoTurno = perTurno.get(1);
        for (int pos = 0; pos < primoTurno.size(); pos++) {
            Partita p = primoTurno.get(pos);
            p.setIscrizioneA(it.next());
            if (pos < bye) {
                p.setStato(PartitaStato.conclusa);
                p.setVincitore(p.getIscrizioneA());
                if (turni > 1) {
                    List<Partita> successivo = perTurno.get(2);
                    Partita prossima = successivo.get(pos / 2);
                    if (pos % 2 == 0) {
                        prossima.setIscrizioneA(p.getIscrizioneA());
                    } else {
                        prossima.setIscrizioneB(p.getIscrizioneA());
                    }
                }
            } else {
                p.setIscrizioneB(it.next());
            }
        }

        // Salvo un turno alla volta e in ordine: cosi' gli id rispettano la posizione
        // nel tabellone (serve a registraRisultato per trovare la partita successiva).
        for (List<Partita> lista : perTurno.values()) {
            for (Partita p : lista) {
                partitaRepository.save(p);
            }
        }
        partitaRepository.flush();

        List<TabelloneResponse.PartitaCreata> create = primoTurno.stream()
                .map(p -> new TabelloneResponse.PartitaCreata(
                        p.getId(),
                        p.getIscrizioneA() == null ? null : p.getIscrizioneA().getId(),
                        p.getIscrizioneB() == null ? null : p.getIscrizioneB().getId()))
                .toList();
        return new TabelloneResponse(idTorneo, 1, primoTurno.size(), create);
    }

    @Transactional(readOnly = true)
    public PartiteResponse partite(Long idTorneo) {
        if (!torneoRepository.existsById(idTorneo)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Torneo non trovato");
        }
        Map<Integer, List<PartiteResponse.PartitaDto>> perTurno = new LinkedHashMap<>();
        for (Partita p : partitaRepository.findByTorneoIdOrderByTurnoAscIdAsc(idTorneo)) {
            perTurno.computeIfAbsent(p.getTurno(), k -> new ArrayList<>()).add(new PartiteResponse.PartitaDto(
                    p.getId(),
                    p.getStato(),
                    p.getDataPartita(),
                    partecipante(p.getIscrizioneA()),
                    p.getPunteggioA(),
                    partecipante(p.getIscrizioneB()),
                    p.getPunteggioB(),
                    p.getVincitore() == null ? null : p.getVincitore().getId()));
        }
        List<PartiteResponse.Turno> turni = perTurno.entrySet().stream()
                .map(e -> new PartiteResponse.Turno(e.getKey(), e.getValue()))
                .toList();
        return new PartiteResponse(idTorneo, turni);
    }

    /** Posizione della partita nel suo round (0, 1, 2...), ricavata dall'ordine degli id. */
    private int posizione(Partita p) {
        List<Partita> stessoTurno = partitaRepository.findByTorneoIdAndTurnoOrderByIdAsc(p.getTorneo().getId(), p.getTurno());
        for (int i = 0; i < stessoTurno.size(); i++) {
            if (stessoTurno.get(i).getId().equals(p.getId())) {
                return i;
            }
        }
        throw new IllegalStateException("Partita non trovata nel suo round");
    }

    private PartiteResponse.Partecipante partecipante(Iscrizione i) {
        return i == null ? null : new PartiteResponse.Partecipante(i.getId(), i.nomePartecipante());
    }

    public RisultatoResponse registraRisultato(Long idPartita, RisultatoRequest r) {
        Partita p = partitaRepository.findById(idPartita)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Partita non trovata"));
        Torneo t = p.getTorneo();
        if (t.getStato() != TorneoStato.in_corso) {
            throw new ApiException(HttpStatus.CONFLICT, "Il torneo non è in corso");
        }
        if (p.getIscrizioneA() == null || p.getIscrizioneB() == null) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "La partita non ha ancora due partecipanti");
        }
        if (r.punteggioA().equals(r.punteggioB())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Il pareggio non è ammesso");
        }

        int ultimoTurno = partitaRepository.turnoMassimo(t.getId());
        int posizione = posizione(p);
        Optional<Partita> successiva = Optional.empty();
        if (p.getTurno() < ultimoTurno) {
            List<Partita> turnoDopo = partitaRepository.findByTorneoIdAndTurnoOrderByIdAsc(t.getId(), p.getTurno() + 1);
            successiva = Optional.of(turnoDopo.get(posizione / 2));
        }

        if (p.getStato() == PartitaStato.conclusa
                && successiva.isPresent() && successiva.get().getStato() == PartitaStato.conclusa) {
            throw new ApiException(HttpStatus.CONFLICT, "Il risultato non è più modificabile");
        }

        Iscrizione vincitore = r.punteggioA() > r.punteggioB() ? p.getIscrizioneA() : p.getIscrizioneB();
        p.setPunteggioA(r.punteggioA());
        p.setPunteggioB(r.punteggioB());
        p.setVincitore(vincitore);
        p.setStato(PartitaStato.conclusa);

        Long prossimaPartita = null;
        if (successiva.isPresent()) {
            Partita prossima = successiva.get();
            if (posizione % 2 == 0) {
                prossima.setIscrizioneA(vincitore);
            } else {
                prossima.setIscrizioneB(vincitore);
            }
            prossimaPartita = prossima.getId();
        } else {

            t.setStato(TorneoStato.concluso);
        }

        return new RisultatoResponse(
                p.getId(),
                p.getStato(),
                p.getPunteggioA(),
                p.getPunteggioB(),
                new RisultatoResponse.Vincitore(vincitore.getId(), vincitore.nomePartecipante()),
                prossimaPartita);
    }
}
