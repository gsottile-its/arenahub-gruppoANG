package com.arenahub.dto.request;

import com.arenahub.entity.enums.RuoloSquadra;
import jakarta.validation.constraints.NotBlank;

/** ruoloSquadra facoltativo (default giocatore); capo_squadra non e' ammesso. */
public record MembroRequest(
        @NotBlank String nickname,
        RuoloSquadra ruoloSquadra) {
}
