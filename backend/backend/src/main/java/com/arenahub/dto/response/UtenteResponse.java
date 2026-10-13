package com.arenahub.dto.response;

import com.arenahub.entity.Utente;
import com.arenahub.entity.enums.RuoloUtente;

public record UtenteResponse(
        Long id,
        String nickname,
        String nome,
        String cognome,
        String email,
        RuoloUtente ruolo) {

    public static UtenteResponse da(Utente u) {
        return new UtenteResponse(u.getId(), u.getNickname(), u.getNome(), u.getCognome(), u.getEmail(), u.getRuolo());
    }
}
