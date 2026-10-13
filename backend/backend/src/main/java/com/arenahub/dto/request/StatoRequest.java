package com.arenahub.dto.request;

import com.arenahub.entity.enums.TorneoStato;
import jakarta.validation.constraints.NotNull;

public record StatoRequest(@NotNull TorneoStato stato) {
}
