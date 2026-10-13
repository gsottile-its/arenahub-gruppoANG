package com.arenahub.dto.response;

import com.arenahub.entity.enums.IscrizioneStato;

import java.time.LocalDateTime;

/** tipo vale "squadra" oppure "utente". */
public record IscrizioneAdminResponse(
        Long id,
        String nome,
        String tipo,
        LocalDateTime dataIscrizione,
        IscrizioneStato stato,
        Integer posizioneAttesa) {
}
