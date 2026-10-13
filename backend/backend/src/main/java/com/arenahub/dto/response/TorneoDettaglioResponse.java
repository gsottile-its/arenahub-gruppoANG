package com.arenahub.dto.response;

import com.arenahub.entity.enums.IscrizioneStato;
import com.arenahub.entity.enums.TorneoStato;

import java.time.LocalDateTime;
import java.util.List;

public record TorneoDettaglioResponse(
        Long id,
        String nome,
        String descrizione,
        String urlImmagine,
        GiocoSintesi gioco,
        List<PiattaformaResponse> piattaforme,
        Integer giocatoriPerSquadra,
        Integer postiMax,
        long iscritti,
        String premio,
        LocalDateTime aperturaIscrizioni,
        LocalDateTime chiusuraIscrizioni,
        TorneoStato stato,
        UtenteBreve organizzatore,
        MiaIscrizione miaIscrizione) {

    public record GiocoSintesi(Long id, String nome, String tipologia) {
    }

    public record MiaIscrizione(Long id, IscrizioneStato stato, SquadraBreve squadra, Integer posizioneAttesa) {
    }
}
