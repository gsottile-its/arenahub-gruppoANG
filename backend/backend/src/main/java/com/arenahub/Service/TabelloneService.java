package com.arenahub.Service;

import com.example.backend.dto.request.RisultatoRequest;
import com.example.backend.dto.request.TabelloneRequest;
import com.example.backend.dto.response.PartiteResponse;
import com.example.backend.dto.response.RisultatoResponse;
import com.example.backend.dto.response.TabelloneResponse;
import com.example.backend.entity.Iscrizione;
import com.example.backend.entity.Partita;
import com.example.backend.entity.Torneo;
import com.example.backend.entity.enums.IscrizioneStato;
import com.example.backend.entity.enums.PartitaStato;
import com.example.backend.entity.enums.TorneoStato;
import com.example.backend.exception.ApiException;
import com.example.backend.repository.IscrizioneRepository;
import com.example.backend.repository.PartitaRepository;
import com.example.backend.repository.TorneoRepository;
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

    public TabelloneResponse genera(Integer idTorneo, TabelloneRequest richiesta) {
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

        LocalDateTime base = (richiesta != null && richiesta.dataPartita() != null)
                ? richiesta.dataPartita()
                : t.getDataInizio();

        Map<Integer, List<Partita>> perTurno = new LinkedHashMap<>();
        for (int turno = 1; turno <= turni; turno++) {
            int quante = size >> turno;
            List<Partita> lista = new ArrayList<>();
            for (int pos = 0; pos < quante; pos++) {
                Partita p = new Partita();
                p.setTorneo(t);
                p.setTurno(turno);
                p.setPosizione(pos);
                p.setStato(PartitaStato.programmata);
                p.setDataPartita(base.plusMinutes(90L * (turno - 1)));
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

        List<Partita> tutte = new ArrayList<>();
        perTurno.values().forEach(tutte::addAll);
        partitaRepository.saveAll(tutte);

        List<TabelloneResponse.PartitaCreata> create = primoTurno.stream()
                .map(p -> new TabelloneResponse.PartitaCreata(
                        p.getId(),
                        p.getIscrizioneA() == null ? null : p.getIscrizioneA().getId(),
                        p.getIscrizioneB() == null ? null : p.getIscrizioneB().getId()))
                .toList();
        return new TabelloneResponse(idTorneo, 1, primoTurno.size(), create);
    }

    @Transactional(readOnly = true)
    public PartiteResponse partite(Integer idTorneo) {
        if (!torneoRepository.existsById(idTorneo)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Torneo non trovato");
        }
        Map<Integer, List<PartiteResponse.PartitaDto>> perTurno = new LinkedHashMap<>();
        for (Partita p : partitaRepository.findByTorneoIdOrderByTurnoAscPosizioneAsc(idTorneo)) {
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

    private PartiteResponse.Partecipante partecipante(Iscrizione i) {
        return i == null ? null : new PartiteResponse.Partecipante(i.getId(), i.nomePartecipante());
    }

    public RisultatoResponse registraRisultato(Integer idPartita, RisultatoRequest r) {
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
        Optional<Partita> successiva = p.getTurno() < ultimoTurno
                ? partitaRepository.findByTorneoIdAndTurnoAndPosizione(t.getId(), p.getTurno() + 1, p.getPosizione() / 2)
                : Optional.empty();

        if (p.getStato() == PartitaStato.conclusa
                && successiva.isPresent() && successiva.get().getStato() == PartitaStato.conclusa) {
            throw new ApiException(HttpStatus.CONFLICT, "Il risultato non è più modificabile");
        }

        Iscrizione vincitore = r.punteggioA() > r.punteggioB() ? p.getIscrizioneA() : p.getIscrizioneB();
        p.setPunteggioA(r.punteggioA());
        p.setPunteggioB(r.punteggioB());
        p.setVincitore(vincitore);
        p.setStato(PartitaStato.conclusa);

        Integer prossimaPartita = null;
        if (successiva.isPresent()) {
            Partita prossima = successiva.get();
            if (p.getPosizione() % 2 == 0) {
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
