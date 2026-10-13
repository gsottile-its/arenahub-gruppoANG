package com.arenahub.dto.response;

import com.arenahub.entity.enums.RuoloSquadra;

import java.util.List;

public record SquadraResponse(Integer id, String nome, List<Membro> membri) {

    public record Membro(Integer idUtente, String nickname, RuoloSquadra ruoloSquadra) {
    }
}
