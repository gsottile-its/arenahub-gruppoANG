package com.arenahub.security;

import com.arenahub.entity.enums.RuoloUtente;

public record UtenteLoggato(Long id, String nickname, RuoloUtente ruolo) {

    public boolean isAdmin() {
        return ruolo == RuoloUtente.admin;
    }
}
