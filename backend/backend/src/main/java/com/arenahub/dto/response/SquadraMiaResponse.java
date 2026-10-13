package com.arenahub.dto.response;

import com.arenahub.entity.enums.RuoloSquadra;

public record SquadraMiaResponse(Integer id, String nome, RuoloSquadra mioRuolo, long membri) {
}
