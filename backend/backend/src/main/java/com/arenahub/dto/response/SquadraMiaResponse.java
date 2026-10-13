package com.arenahub.dto.response;

import com.arenahub.entity.enums.RuoloSquadra;

public record SquadraMiaResponse(Long id, String nome, RuoloSquadra mioRuolo, long membri) {
}
