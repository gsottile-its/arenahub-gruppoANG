package com.arenahub.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/** Tutti i campi sono facoltativi: null significa "non cambiare". */
public record UtenteUpdateRequest(
        @Size(min = 3, max = 20) String nickname,
        @Email String email,
        @Size(min = 1, max = 50) String nome,
        @Size(min = 1, max = 50) String cognome,
        @Size(min = 8) String password) {
}
