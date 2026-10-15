package com.arenahub.Service;

import com.arenahub.dto.request.IscrizioneRequest;
import com.arenahub.dto.response.ConfermaResponse;
import com.arenahub.dto.response.IscrizioneAdminResponse;
import com.arenahub.dto.response.IscrizioneResponse;
import com.arenahub.dto.response.IscrizioniPage;
import com.arenahub.dto.response.RitiroResponse;
import com.arenahub.dto.response.SquadraBreve;
import com.arenahub.dto.response.UtenteBreve;
import com.arenahub.entity.Iscrizione;
import com.arenahub.entity.Squadra;
import com.arenahub.entity.Torneo;
import com.arenahub.entity.Utente;
import com.arenahub.entity.enums.IscrizioneStato;
import com.arenahub.entity.enums.RuoloSquadra;
import com.arenahub.entity.enums.TorneoStato;
import com.arenahub.exception.ApiException;
import com.arenahub.repository.IscrizioneRepository;
import com.arenahub.repository.MembroSquadraRepository;
import com.arenahub.repository.SquadraRepository;
import com.arenahub.repository.TorneoRepository;
import com.arenahub.repository.UtenteRepository;
import com.arenahub.security.UtenteLoggato;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class IscrizioneService {

    private static final int DIMENSIONE_PAGINA = 20;

    private final IscrizioneRepository iscrizioneRepository;
    private final TorneoRepository torneoRepository;
    private final SquadraRepository squadraRepository;
    private final MembroSquadraRepository membroRepository;
    private final UtenteRepository utenteRepository;
    private final TorneoMapper mapper;
    private final ConfigurazioneService configurazioneService;

    public IscrizioneResponse iscrivi(Long idTorneo, IscrizioneRequest richiesta, UtenteLoggato utente) {

        Torneo t = torneoRepository.trovaPerAggiornamento(idTorneo)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Torneo non trovato"));

        LocalDateTime ora = LocalDateTime.now();
        if (t.getStato() != TorneoStato.iscrizioni_aperte
                || ora.isBefore(t.getAperturaIscrizioni())
                || ora.isAfter(t.getChiusuraIscrizioni())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Le iscrizioni non sono aperte");
        }

        int max = configurazioneService.maxTorneiPerUtente();
        if (iscrizioneRepository.contaTorneiAttivi(utente.id()) >= max) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Hai raggiunto il limite di " + max + " tornei");
        }

        Long idSquadra = richiesta == null ? null : richiesta.idSquadra();
        Iscrizione i = new Iscrizione();
        i.setTorneo(t);

        if (t.getGiocatoriPerSquadra() > 1) {
            if (idSquadra == null) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Questo torneo è a squadre: scegli la squadra da iscrivere");
            }
            Squadra squadra = squadraRepository.findById(idSquadra)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Squadra non trovata"));
            membroRepository.findBySquadraIdAndUtenteId(idSquadra, utente.id())
                    .filter(m -> m.getRuoloSquadra() == RuoloSquadra.capo_squadra)
                    .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
                            "Solo il capo squadra può iscrivere la squadra"));
            long membri = membroRepository.countBySquadraId(idSquadra);
            if (membri < t.getGiocatoriPerSquadra()) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "La squadra deve avere almeno " + t.getGiocatoriPerSquadra() + " membri");
            }
            if (iscrizioneRepository.existsByTorneoIdAndSquadraIdAndStatoNot(
                    idTorneo, idSquadra, IscrizioneStato.ritirata)) {
                throw new ApiException(HttpStatus.CONFLICT, "Già iscritto a questo torneo");
            }
            i.setSquadra(squadra);
        } else {
            if (idSquadra != null) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Questo torneo è individuale: non indicare una squadra");
            }
            if (iscrizioneRepository.existsByTorneoIdAndUtenteIdAndStatoNot(
                    idTorneo, utente.id(), IscrizioneStato.ritirata)) {
                throw new ApiException(HttpStatus.CONFLICT, "Già iscritto a questo torneo");
            }
            Utente u = utenteRepository.findById(utente.id())
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Autenticazione richiesta"));
            i.setUtente(u);
        }

        i.setStato(statoIniziale(t));
        i.setDataIscrizione(ora);
        i = iscrizioneRepository.save(i);

        return new IscrizioneResponse(
                i.getId(),
                t.getId(),
                i.getStato(),
                i.getSquadra() == null ? null : new SquadraBreve(i.getSquadra().getId(), i.getSquadra().getNome()),
                i.getUtente() == null ? null : new UtenteBreve(i.getUtente().getId(), i.getUtente().getNickname()),
                i.getDataIscrizione(),
                mapper.posizioneAttesa(i));
    }

    private IscrizioneStato statoIniziale(Torneo t) {
        long occupati = iscrizioneRepository.countByTorneoIdAndStatoIn(
                t.getId(), TorneoMapper.STATI_CHE_OCCUPANO);
        return occupati < t.getPostiMax() ? IscrizioneStato.in_attesa : IscrizioneStato.lista_attesa;
    }

    @Transactional(readOnly = true)
    public IscrizioniPage elenco(Long idTorneo, String stato, int pagina) {
        if (!torneoRepository.existsById(idTorneo)) {