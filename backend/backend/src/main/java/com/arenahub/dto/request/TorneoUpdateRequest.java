package com.arenahub.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

/** Stessi campi di TorneoRequest, tutti facoltativi: null significa "non cambiare". */
public record TorneoUpdateRequest(
        @Size(min = 1, max = 100) String nome,
        Integer idGioco,
        @Size(min = 1) List<Integer> idPiattaforme,
        @Size(max = 50) String premio,
        LocalDateTime dataInizio,
        LocalDateTime dataFine,
        LocalDateTime aperturaIscrizioni,
        LocalDateTime chiusuraIscrizioni,
        @Min(1) Integer giocatoriPerSquadra,
        @Min(2) Integer postiMax,
        String descrizione,
        String regolamento) {
}
