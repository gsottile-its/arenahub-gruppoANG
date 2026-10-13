package com.arenahub.Service;

import com.example.backend.dto.request.MembroRequest;
import com.example.backend.dto.request.SquadraRequest;
import com.example.backend.dto.response.MembroResponse;
import com.example.backend.dto.response.SquadraMiaResponse;
import com.example.backend.dto.response.SquadraResponse;
import com.example.backend.entity.MembroSquadra;
import com.example.backend.entity.MembroSquadraId;
import com.example.backend.entity.Squadra;
import com.example.backend.entity.Utente;
import com.example.backend.entity.enums.RuoloSquadra;
import com.example.backend.exception.ApiException;
import com.example.backend.repository.MembroSquadraRepository;
import com.example.backend.repository.SquadraRepository;
import com.example.backend.repository.UtenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public List<SquadraMiaResponse> mie(Integer idUtente) {
        return membroRepository.findByUtenteId(idUtente).stream()
                .map(m -> new SquadraMiaResponse(
                        m.getSquadra().getId(),
                        m.getSquadra().getNome(),
                        m.getRuoloSquadra(),
                        membroRepository.countBySquadraId(m.getSquadra().getId())))
                .toList();
    }

    public SquadraResponse crea(SquadraRequest r, Integer idUtente) {
        if (squadraRepository.existsByNome(r.nome())) {
            throw new ApiException(HttpStatus.CONFLICT, "Nome squadra già in uso");
        }
        if (squadraRepository.countByCreatoreId(idUtente) >= MAX_SQUADRE_CREATE) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Hai raggiunto il limite di 10 squadre");
        }
        Utente creatore = utenteRepository.findById(idUtente)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Autenticazione richiesta"));

        Squadra s = new Squadra();
        s.setNome(r.nome());
        s.setCreatore(creatore);
        s = squadraRepository.save(s);

        membroRepository.save(nuovoMembro(s, creatore, RuoloSquadra.capo_squadra));
        return new SquadraResponse(s.getId(), s.getNome(),
                List.of(new SquadraResponse.Membro(creatore.getId(), creatore.getNickname(), RuoloSquadra.capo_squadra)));
    }

    public MembroResponse aggiungiMembro(Integer idSquadra, MembroRequest r, Integer idRichiedente) {
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

    public void rimuoviMembro(Integer idSquadra, Integer idUtente, Integer idRichiedente) {
        MembroSquadra target = membroRepository.findBySquadraIdAndUtenteId(idSquadra, idUtente)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Membro non trovato"));

        boolean richiedenteCapo = membroRepository.findBySquadraIdAndUtenteId(idSquadra, idRichiedente)
                .map(m -> m.getRuoloSquadra() == RuoloSquadra.capo_squadra)
                .orElse(false);
        if (!idUtente.equals(idRichiedente) && !richiedenteCapo) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Solo il capo squadra può rimuovere i membri");
        }

        if (target.getRuoloSquadra() == RuoloSquadra.capo_squadra) {
            if (membroRepository.countBySquadraId(idSquadra) > 1) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "Il capo squadra non può uscire finché ci sono altri membri");
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
