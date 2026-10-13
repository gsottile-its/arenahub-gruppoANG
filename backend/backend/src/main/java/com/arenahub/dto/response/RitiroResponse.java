package com.arenahub.dto.response;

import com.arenahub.entity.enums.IscrizioneStato;

/** promossa e' null se nessuno era in lista d'attesa. */
public record RitiroResponse(Long id, Long idTorneo, IscrizioneStato stato, Promossa promossa) {

    public record Promossa(Long id, String nome, IscrizioneStato stato) {
    }
}
