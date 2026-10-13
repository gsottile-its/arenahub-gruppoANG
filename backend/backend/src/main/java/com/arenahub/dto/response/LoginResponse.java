package com.arenahub.dto.response;

import com.arenahub.entity.enums.RuoloUtente;

public record LoginResponse(String token, UtenteSintesi utente) {

    public record UtenteSintesi(Integer id, String nickname, RuoloUtente ruolo) {
    }
}
