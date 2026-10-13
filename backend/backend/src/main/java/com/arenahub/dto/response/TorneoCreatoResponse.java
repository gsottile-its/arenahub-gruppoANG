package com.arenahub.dto.response;

import com.arenahub.entity.enums.TorneoStato;

import java.time.LocalDateTime;
import java.util.List;

public record TorneoCreatoResponse(
        Long id,
        String nome,
        TorneoStato stato,
        TorneoDettaglioResponse.GiocoSintesi gioco,
        List<PiattaformaResponse> piattaforme,
        Integer giocatoriPerSquadra,
        Integer postiMax,
        String premio,
        LocalDateTime aperturaIscrizioni,
        LocalDateTime chiusuraIscrizioni,
        String urlImmagine) {
}
