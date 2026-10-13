package com.arenahub.dto.response;

import com.arenahub.entity.enums.RuoloUtente;

public record LoginResponse(String token, UtenteSintesi utente) {

    public record UtenteSintesi(Long id, String nickname, RuoloUtente ruolo) {
    }
}
