package com.arenahub.Service;

import com.example.backend.dto.request.TorneoRequest;
import com.example.backend.dto.request.TorneoUpdateRequest;
import com.example.backend.dto.response.StatoResponse;
import com.example.backend.dto.response.TorneoCardPage;
import com.example.backend.dto.response.TorneoCardResponse;
import com.example.backend.dto.response.TorneoCreatoResponse;
import com.example.backend.dto.response.TorneoDettaglioResponse;
import com.example.backend.entity.Gioco;
import com.example.backend.entity.Piattaforma;
import com.example.backend.entity.Torneo;
import com.example.backend.entity.enums.IscrizioneStato;
import com.example.backend.entity.enums.TorneoStato;
import com.example.backend.exception.ApiException;
import com.example.backend.repository.GiocoRepository;
import com.example.backend.repository.IscrizioneRepository;
import com.example.backend.repository.PartitaRepository;
import com.example.backend.repository.PiattaformaRepository;
import com.example.backend.repository.TorneoRepository;
import com.example.backend.repository.TorneoSpecs;
import com.example.backend.repository.UtenteRepository;
import com.example.backend.security.UtenteLoggato;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
@RequiredArgsConstructor
public class TorneoService {

    private static final int DIMENSIONE_PAGINA = 10;

    private static final Map<TorneoStato, Set<TorneoStato>> TRANSIZIONI = Map.of(
            TorneoStato.bozza, Set.of(TorneoStato.iscrizioni_aperte, TorneoStato.annullato),
            TorneoStato.iscrizioni_aperte, Set.of(TorneoStato.iscrizioni_chiuse, TorneoStato.annullato),
            TorneoStato.iscrizioni_chiuse, Set.of(TorneoStato.in_corso, TorneoStato.annullato),
            TorneoStato.in_corso, Set.of(TorneoStato.concluso, TorneoStato.annullato),
            TorneoStato.concluso, Set.of(),
            TorneoStato.annullato, Set.of());

    private static final Set<TorneoStato> MODIFICABILI = Set.of(
            TorneoStato.bozza, TorneoStato.iscrizioni_aperte, TorneoStato.iscrizioni_chiuse);

    private final TorneoRepository torneoRepository;
    private final GiocoRepository giocoRepository;
    private final PiattaformaRepository piattaformaRepository;
    private final UtenteRepository utenteRepository;
    private final IscrizioneRepository iscrizioneRepository;
    private final PartitaRepository partitaRepository;
    private final TorneoMapper mapper;

    @Transactional(readOnly = true)
    public TorneoCardPage elenco(String stato, String iscritto, int pagina, UtenteLoggato utente) {
        boolean admin = utente != null && utente.isAdmin();
        Integer idUtente = utente == null ? null : utente.id();

        TorneoStato filtro = null;
        if (stato != null && !stato.isBlank()) {
            try {
                filtro = TorneoStato.valueOf(stato);
            } catch (IllegalArgumentException e) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Stato non valido");
            }
        }

        boolean soloMiei = false;
        if (iscritto != null && !iscritto.isBlank()) {
            if (!"me".equals(iscritto)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Dati non validi");
            }
            if (utente == null) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Autenticazione richiesta");
            }
            soloMiei = true;
        }

        int p = Math.max(pagina, 1);
        if (filtro == TorneoStato.bozza && !admin) {
            return new TorneoCardPage(p, 0, List.of());
        }

        Specification<Torneo> spec = TorneoSpecs.tutti();
        if (filtro != null) {
            spec = spec.and(TorneoSpecs.conStato(filtro));
        } else if (!admin) {
            spec = spec.and(TorneoSpecs.senzaBozze());
        }
        if (soloMiei) {
            spec = spec.and(TorneoSpecs.iscrittoA(utente.id()));
        }

        Page<Torneo> risultato = torneoRepository.findAll(
                spec, PageRequest.of(p - 1, DIMENSIONE_PAGINA, Sort.by(Sort.Direction.DESC, "id")));
        List<TorneoCardResponse> card = risultato.getContent().stream()
                .map(t -> mapper.toCard(t, idUtente))
                .toList();
        return new TorneoCardPage(p, risultato.getTotalPages(), card);
    }

    @Transactional(readOnly = true)
    public TorneoDettaglioResponse dettaglio(Integer id, UtenteLoggato utente) {
        Torneo t = trova(id);
        boolean admin = utente != null && utente.isAdmin();
        if (t.getStato() == TorneoStato.bozza && !admin) {
            throw nonTrovato();
        }
        return mapper.toDettaglio(t, utente == null ? null : utente.id());
    }

    public TorneoCreatoResponse crea(TorneoRequest r, Integer idAdmin) {
        Gioco gioco = giocoRepository.findById(r.idGioco())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Gioco non trovato"));
        Set<Piattaforma> piattaforme = caricaPiattaforme(r.idPiattaforme());
        validaDate(r.aperturaIscrizioni(), r.chiusuraIscrizioni(), r.dataInizio(), r.dataFine());

        Torneo t = new Torneo();
        t.setOrganizzatore(utenteRepository.getReferenceById(idAdmin));
        t.setGioco(gioco);
        t.setPiattaforme(piattaforme);
        t.setNome(r.nome());
        t.setPremio(r.premio());
        t.setDataInizio(r.dataInizio());
        t.setDataFine(r.dataFine());
        t.setAperturaIscrizioni(r.aperturaIscrizioni());
        t.setChiusuraIscrizioni(r.chiusuraIscrizioni());
        t.setGiocatoriPerSquadra(r.giocatoriPerSquadra());
        t.setPostiMax(r.postiMax());
        t.setDescrizione(r.descrizione());
        t.setRegolamento(r.regolamento());
        t.setStato(TorneoStato.bozza);

        return mapper.toCreato(torneoRepository.save(t));
    }

    public TorneoDettaglioResponse modifica(Integer id, TorneoUpdateRequest r) {
        Torneo t = trova(id);
        if (!MODIFICABILI.contains(t.getStato())) {
            throw new ApiException(HttpStatus.CONFLICT, "Il torneo non è più modificabile");
        }

        boolean haIscrizioni = iscrizioneRepository.existsByTorneoIdAndStatoNot(id, IscrizioneStato.ritirata);
        boolean cambiaGioco = r.idGioco() != null && !r.idGioco().equals(t.getGioco().getId());
        boolean cambiaFormato = r.giocatoriPerSquadra() != null
                && !r.giocatoriPerSquadra().equals(t.getGiocatoriPerSquadra());
        if (haIscrizioni && (cambiaGioco || cambiaFormato)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Ci sono già iscrizioni: gioco e formato non sono modificabili");
        }

        if (r.postiMax() != null) {
            long occupati = mapper.iscritti(t);
            if (r.postiMax() < occupati) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Ci sono già " + occupati + " iscrizioni");
            }
            t.setPostiMax(r.postiMax());
        }
        if (cambiaGioco) {
            t.setGioco(giocoRepository.findById(r.idGioco())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Gioco non trovato")));
        }
        if (r.idPiattaforme() != null) {
            t.setPiattaforme(caricaPiattaforme(r.idPiattaforme()));
        }
        if (cambiaFormato) {
            t.setGiocatoriPerSquadra(r.giocatoriPerSquadra());
        }
        if (r.nome() != null) t.setNome(r.nome());
        if (r.premio() != null) t.setPremio(r.premio());
        if (r.descrizione() != null) t.setDescrizione(r.descrizione());
        if (r.regolamento() != null) t.setRegolamento(r.regolamento());
        if (r.dataInizio() != null) t.setDataInizio(r.dataInizio());
        if (r.dataFine() != null) t.setDataFine(r.dataFine());
        if (r.aperturaIscrizioni() != null) t.setAperturaIscrizioni(r.aperturaIscrizioni());
        if (r.chiusuraIscrizioni() != null) t.setChiusuraIscrizioni(r.chiusuraIscrizioni());

        validaDate(t.getAperturaIscrizioni(), t.getChiusuraIscrizioni(), t.getDataInizio(), t.getDataFine());
        return mapper.toDettaglio(t, null);
    }

    public StatoResponse cambiaStato(Integer id, TorneoStato nuovo) {
        Torneo t = trova(id);
        if (!TRANSIZIONI.get(t.getStato()).contains(nuovo)) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Impossibile passare da " + t.getStato() + " a " + nuovo);
        }
        if (nuovo == TorneoStato.in_corso && !partitaRepository.existsByTorneoId(id)) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Genera il tabellone prima di avviare il torneo");
        }
        t.setStato(nuovo);
        return new StatoResponse(t.getId(), t.getStato());
    }

    private Torneo trova(Integer id) {
        return torneoRepository.findById(id).orElseThrow(this::nonTrovato);
    }

    private ApiException nonTrovato() {
        return new ApiException(HttpStatus.NOT_FOUND, "Torneo non trovato");
    }

    private Set<Piattaforma> caricaPiattaforme(List<Integer> ids) {
        Set<Integer> richiesti = new HashSet<>(ids);
        List<Piattaforma> trovate = piattaformaRepository.findAllById(richiesti);
        if (trovate.size() != richiesti.size()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Piattaforma non trovata");
        }
        return new HashSet<>(trovate);
    }

    private void validaDate(LocalDateTime apertura, LocalDateTime chiusura,
                            LocalDateTime inizio, LocalDateTime fine) {
        if (!apertura.isBefore(chiusura)) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "L'apertura delle iscrizioni deve essere prima della chiusura");
        }
        if (chiusura.isAfter(inizio)) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Le iscrizioni devono chiudersi prima dell'inizio del torneo");
        }
        if (fine != null && fine.isBefore(inizio)) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "La fine del torneo deve essere dopo l'inizio");
        }
    }
}
