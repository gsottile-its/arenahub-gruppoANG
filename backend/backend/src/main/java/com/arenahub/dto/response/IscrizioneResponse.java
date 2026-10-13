package com.arenahub.dto.response;

import com.arenahub.entity.enums.IscrizioneStato;

import java.time.LocalDateTime;

/** squadra e utente: uno dei due e' null (squadra nei tornei a squadre, utente nei tornei 1 vs 1). */
public record IscrizioneResponse(
        Integer id,
        Integer idTorneo,
        IscrizioneStato stato,
        SquadraBreve squadra,
        UtenteBreve utente,
        LocalDateTime dataIscrizione,
        Integer posizioneAttesa) {
}
