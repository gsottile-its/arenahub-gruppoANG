package com.arenahub.dto.request;

import jakarta.validation.constraints.NotNull;

public record LimiteIscrizioniRequest(@NotNull Integer maxTorneiPerUtente) {
}