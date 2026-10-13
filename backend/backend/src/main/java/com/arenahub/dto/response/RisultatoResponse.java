package com.arenahub.dto.response;

import com.arenahub.entity.enums.PartitaStato;

/** prossimaPartita e' null per la finale. */
public record RisultatoResponse(
        Long id,
        PartitaStato stato,
        Integer punteggioA,
        Integer punteggioB,
        Vincitore vincitore,
        Long prossimaPartita) {

    public record Vincitore(Long idIscrizione, String nome) {
    }
}
