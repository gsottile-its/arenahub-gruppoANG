package com.arenahub.dto.response;

import com.arenahub.entity.enums.PartitaStato;

/** prossimaPartita e' null per la finale. */
public record RisultatoResponse(
        Integer id,
        PartitaStato stato,
        Integer punteggioA,
        Integer punteggioB,
        Vincitore vincitore,
        Integer prossimaPartita) {

    public record Vincitore(Integer idIscrizione, String nome) {
    }
}
