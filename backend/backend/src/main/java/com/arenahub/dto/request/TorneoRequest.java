package com.arenahub.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public record TorneoRequest(
        @NotBlank @Size(max = 100) String nome,
        @NotNull Integer idGioco,
        @NotEmpty List<Integer> idPiattaforme,
        @Size(max = 50) String premio,
        @NotNull LocalDateTime dataInizio,
        LocalDateTime dataFine,
        @NotNull LocalDateTime aperturaIscrizioni,
        @NotNull LocalDateTime chiusuraIscrizioni,
        @NotNull @Min(1) Integer giocatoriPerSquadra,
        @NotNull @Min(2) Integer postiMax,
        String descrizione,
        String regolamento) {
}
