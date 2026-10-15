package com.arenahub.dto.response;

import java.time.LocalDateTime;

public record LimiteAggiornatoResponse(Integer maxTorneiPerUtente, LocalDateTime dataModifica) {
}
