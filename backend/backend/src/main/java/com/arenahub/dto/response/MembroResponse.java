package com.arenahub.dto.response;

import com.arenahub.entity.enums.RuoloSquadra;

public record MembroResponse(Integer idSquadra, Integer idUtente, String nickname, RuoloSquadra ruoloSquadra) {
}
