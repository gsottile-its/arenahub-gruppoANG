package com.arenahub.dto.response;

import com.arenahub.entity.enums.RuoloSquadra;

import java.util.List;

public record SquadraResponse(Long id, String nome, List<Membro> membri) {

    public record Membro(Long idUtente, String nickname, RuoloSquadra ruoloSquadra) {
    }
}
