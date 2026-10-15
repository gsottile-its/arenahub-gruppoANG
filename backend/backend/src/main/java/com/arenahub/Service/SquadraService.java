package com.arenahub.Service;

import com.arenahub.dto.request.MembroRequest;
import com.arenahub.dto.request.SquadraRequest;
import com.arenahub.dto.response.MembroResponse;
import com.arenahub.dto.response.SquadraMiaResponse;
import com.arenahub.dto.response.SquadraResponse;
import com.arenahub.entity.MembroSquadra;
import com.arenahub.entity.MembroSquadraId;
import com.arenahub.entity.Squadra;
import com.arenahub.entity.Utente;
import com.arenahub.entity.enums.IscrizioneStato;
import com.arenahub.entity.enums.RuoloSquadra;
import com.arenahub.exception.ApiException;
import com.arenahub.repository.IscrizioneRepository;
import com.arenahub.repository.MembroSquadraRepository;
import com.arenahub.repository.SquadraRepository;
import com.arenahub.repository.UtenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class SquadraService {

    private static final int MAX_SQUADRE_CREATE = 10;
    private static final int MAX_MEMBRI = 28;

    private final SquadraRepository squadraRepository;
    private final MembroSquadraRepository membroRepository;
    private final UtenteRepository utenteRepository;
    private final IscrizioneRepository iscrizioneRepository;

    @Transactional(readOnly = true)
    public List<SquadraMiaResponse> mie(Long idUtente) {
        return membroRepository.findByUtenteId(idUtente).stream()
                .map(m -> new SquadraMiaResponse(
                        m.getSquadra().getId(),
                        m.getSquadra().getNome(),
                        m.getRuoloSquadra(),
                        membroRepository.countBySquadraId(m.getSquadra().getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public SquadraResponse dettaglio(Long idSquadra, Long idRichiedente) {
        Squadra s = squadraRepository.findById(idSquadra)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Squadra non trovata"));
        if (!membroRepository.existsBySquadraIdAndUtenteId(idSquadra, idRichiedente)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Non fai parte di questa squadra");
        }

        List<SquadraResponse.Membro> membri = membroRepository.findBySquadraId(idSquadra).stream()
                .sorted(Comparator.comparing((MembroSquadra m) -> m.getRuoloSquadra() != RuoloSquadra.capo_squadra)
                        .thenComparing(m -> m.getUtente().getNickname(), String.CASE_INSENSITIVE_ORDER))
                .map(m -> new SquadraResponse.Membro(
                        m.getUtente().getId(), m.getUtente().getNickname(), m.getRuoloSquadra()))
                .toList();
        return new SquadraResponse(s.getId(), s.getNome(), membri);
    }

    public SquadraResponse crea(SquadraRequest r, Long idUtente) {
        if (squadraRepository.existsByNome(r.nome())) {
            throw new ApiException(HttpStatus.CONFLICT, "Nome squadra già in uso");
        }
        if (membroRepository.countByUtenteIdAndRuoloSquadra(idUtente, RuoloSquadra.capo_squadra) >= MAX_SQUADRE_CREATE) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Hai raggiunto il limite di 10 squadre");
        }
        Utente creatore = utenteRepository.findById(idUtente)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Autenticazione richiesta"));

        Squadra s = new Squadra();
        s.setNome(r.nome());
        s = squadraRepository.save(s);

        membroRepository.save(nuovoMembro(s, creatore, RuoloSquadra.capo_squadra));
        return new SquadraResponse(s.getId(), s.getNome(),
                List.of(new SquadraResponse.Membro(creatore.getId(), creatore.getNickname(), RuoloSquadra.capo_squadra)));
    }

    public MembroResponse aggiungiMembro(Long idSquadra, MembroRequest r, Long idRichiedente) {
        Squadra s = squadraRepository.findById(idSquadra)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Squadra non trovata"));
        boolean capo = membroRepository.findBySquadraIdAndUtenteId(idSquadra, idRichiedente)
                .map(m -> m.getRuoloSquadra() == RuoloSquadra.capo_squadra)
                .orElse(false);
        if (!capo) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Solo il capo squadra può gestire i membri");
        }

        RuoloSquadra ruolo = r.ruoloSquadra() == null ? RuoloSquadra.giocatore : r.ruoloSquadra();
        if (ruolo == RuoloSquadra.capo_squadra) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Dati non validi");
        }

        Utente nuovo = utenteRepository.findByNickname(r.nickname())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Utente non trovato"));
        if (membroRepository.existsBySquadraIdAndUtenteId(idSquadra, nuovo.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "L'utente fa già parte della squadra");
        }
        if (membroRepository.countBySquadraId(idSquadra) >= MAX_MEMBRI) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "La squadra ha raggiunto il numero massimo di membri");
        }

        membroRepository.save(nuovoMembro(s, nuovo, ruolo));
        return new MembroResponse(s.getId(), nuovo.getId(), nuovo.getNickname(), ruolo);
    }

    public void rimuoviMembro(Long idSquadra, Long idUtente, Long idRichiedente) {
        MembroSquadra target = membroRepository.findBySquadraIdAndUtenteId(idSquadra, idUtente)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Membro non trovato"));

        boolean richiedenteCapo = membroRepository.findBySquadraIdAndUtenteId(idSquadra, idRichiedente)
                .map(m -> m.getRuoloSquadra() == RuoloSquadra.capo_squadra)
                .orElse(false);
        if (!richiedenteCapo) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Solo il capo squadra può rimuovere i membri");
        }

        if (target.getRuoloSquadra() == RuoloSquadra.capo_squadra) {
            if (membroRepository.countBySquadraId(idSquadra) > 1) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "Il capo squadra non può uscire finché ci sono altri membri");
            }


            if (iscrizioneRepository.existsBySquadraIdAndStatoNot(idSquadra, IscrizioneStato.ritirata)) {
                throw new ApiException(HttpStatus.CONFLICT, "La squadra è iscritta a dei tornei");
            }
            try {
                membroRepository.delete(target);
                membroRepository.flush();
                squadraRepository.deleteById(idSquadra);
                squadraRepository.flush();
            } catch (DataIntegrityViolationException e) {
                throw new ApiException(HttpStatus.CONFLICT, "La squadra è iscritta a dei tornei");
            }
            return;
        }
        membroRepository.delete(target);
    }

    private MembroSquadra nuovoMembro(Squadra squadra, Utente utente, RuoloSquadra ruolo) {
        MembroSquadra m = new MembroSquadra();
        m.setId(new MembroSquadraId(squadra.getId(), utente.getId()));
        m.setSquadra(squadra);
        m.setUtente(utente);
        m.setRuoloSquadra(ruolo);
        return m;
    }
}