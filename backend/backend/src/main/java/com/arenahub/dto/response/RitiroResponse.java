package com.arenahub.dto.response;

import com.arenahub.entity.enums.IscrizioneStato;

/** promossa e' null se nessuno era in lista d'attesa. */
public record RitiroResponse(Integer id, Integer idTorneo, IscrizioneStato stato, Promossa promossa) {

    public record Promossa(Integer id, String nome, IscrizioneStato stato) {
    }
}
