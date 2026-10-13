package com.arenahub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SquadraRequest(@NotBlank @Size(max = 50) String nome) {
}
