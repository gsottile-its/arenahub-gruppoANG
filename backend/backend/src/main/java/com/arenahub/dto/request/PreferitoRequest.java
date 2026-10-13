package com.arenahub.dto.request;

import jakarta.validation.constraints.NotNull;

public record PreferitoRequest(@NotNull Integer idTorneo) {
}
