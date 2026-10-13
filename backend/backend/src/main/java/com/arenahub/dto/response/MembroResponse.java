package com.arenahub.dto.response;

import com.arenahub.entity.enums.RuoloSquadra;

public record MembroResponse(Long idSquadra, Long idUtente, String nickname, RuoloSquadra ruoloSquadra) {
}
