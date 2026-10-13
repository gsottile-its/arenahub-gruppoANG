package com.arenahub.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RisultatoRequest(
        @NotNull @Min(0) Integer punteggioA,
        @NotNull @Min(0) Integer punteggioB) {
}
