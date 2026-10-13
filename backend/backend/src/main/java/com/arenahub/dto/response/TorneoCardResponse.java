package com.arenahub.dto.response;

import com.arenahub.entity.enums.IscrizioneStato;
import com.arenahub.entity.enums.TorneoStato;

import java.time.LocalDateTime;
import java.util.List;

/** mioStato e salvato sono null quando la richiesta non ha un token valido. */
public record TorneoCardResponse(
        Integer id,
        String nome,
        String urlImmagine,
        String gioco,
        List<String> piattaforme,
        Integer giocatoriPerSquadra,
        LocalDateTime dataInizio,
        Integer postiMax,
        long iscritti,
        TorneoStato stato,
        IscrizioneStato mioStato,
        Boolean salvato) {
}
