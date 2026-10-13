package com.arenahub.Service;

import com.arenahub.dto.response.PiattaformaResponse;
import com.arenahub.dto.response.SquadraBreve;
import com.arenahub.dto.response.TorneoCardResponse;
import com.arenahub.dto.response.TorneoCreatoResponse;
import com.arenahub.dto.response.TorneoDettaglioResponse;
import com.arenahub.dto.response.UtenteBreve;
import com.arenahub.entity.Iscrizione;
import com.arenahub.entity.Piattaforma;
import com.arenahub.entity.Torneo;
import com.arenahub.entity.enums.IscrizioneStato;
import com.arenahub.repository.IscrizioneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TorneoMapper {

    public static final List<IscrizioneStato> STATI_CHE_OCCUPANO =
            List.of(IscrizioneStato.in_attesa, IscrizioneStato.confermata);

    private final IscrizioneRepository iscrizioneRepository;

    public long iscritti(Torneo t) {
        return iscrizioneRepository.countByTorneoIdAndStatoIn(t.getId(), STATI_CHE_OCCUPANO);
    }

    public Integer posizioneAttesa(Iscrizione i) {
        if (i.getStato() != IscrizioneStato.lista_attesa) {
            return null;
        }
        return (int) iscrizioneRepository.countByTorneoIdAndStatoAndIdLessThanEqual(
                i.getTorneo().getId(), IscrizioneStato.lista_attesa, i.getId());
    }

    public TorneoCardResponse toCard(Torneo t, Long idUtente) {
        IscrizioneStato mioStato = null;
        if (idUtente != null) {
            mioStato = iscrizioneRepository.trovaAttiveDiUtente(t.getId(), idUtente).stream()
                    .findFirst()
                    .map(Iscrizione::getStato)
                    .orElse(null);
        }
        return new TorneoCardResponse(
                t.getId(),
                t.getNome(),
                t.getUrlImage(),
                t.getGioco().getNome(),
                t.getPiattaforme().stream().map(Piattaforma::getNome).sorted().toList(),
                t.getGiocatoriPerSquadra(),
                t.getChiusuraIscrizioni(),
                t.getPostiMax(),
                iscritti(t),
                t.getStato(),
                mioStato);
    }

    public TorneoDettaglioResponse toDettaglio(Torneo t, Long idUtente) {
        TorneoDettaglioResponse.MiaIscrizione mia = null;
        if (idUtente != null) {
            mia = iscrizioneRepository.trovaAttiveDiUtente(t.getId(), idUtente).stream()
                    .findFirst()
                    .map(i -> new TorneoDettaglioResponse.MiaIscrizione(
                            i.getId(),
                            i.getStato(),
                            i.getSquadra() == null ? null
                                    : new SquadraBreve(i.getSquadra().getId(), i.getSquadra().getNome()),
                            posizioneAttesa(i)))
                    .orElse(null);
        }
        return new TorneoDettaglioResponse(
                t.getId(),
                t.getNome(),
                t.getDescrizione(),
                t.getUrlImage(),
                gioco(t),
                piattaforme(t),
                t.getGiocatoriPerSquadra(),
                t.getPostiMax(),
                iscritti(t),
                t.getPremio(),
                t.getAperturaIscrizioni(),
                t.getChiusuraIscrizioni(),
                t.getStato(),
                new UtenteBreve(t.getOrganizzatore().getId(), t.getOrganizzatore().getNickname()),
                mia);
    }

    public TorneoCreatoResponse toCreato(Torneo t) {
        return new TorneoCreatoResponse(
                t.getId(),
                t.getNome(),
                t.getStato(),
                gioco(t),
                piattaforme(t),
                t.getGiocatoriPerSquadra(),
                t.getPostiMax(),
                t.getPremio(),
                t.getAperturaIscrizioni(),
                t.getChiusuraIscrizioni(),
                t.getUrlImage());
    }

    private TorneoDettaglioResponse.GiocoSintesi gioco(Torneo t) {
        return new TorneoDettaglioResponse.GiocoSintesi(
                t.getGioco().getId(), t.getGioco().getNome(), t.getGioco().getTipologia().getNome());
    }

    private List<PiattaformaResponse> piattaforme(Torneo t) {
        return t.getPiattaforme().stream()
                .sorted(Comparator.comparing(Piattaforma::getId))
                .map(p -> new PiattaformaResponse(p.getId(), p.getNome()))
                .toList();
    }
}
