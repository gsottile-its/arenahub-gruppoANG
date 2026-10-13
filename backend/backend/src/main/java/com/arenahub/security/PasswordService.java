package com.arenahub.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Hash delle password con BCrypt, lo stesso formato ($2a$...) che lo schema SQL
 * usa per l'utente admin (pgcrypto: crypt(..., gen_salt('bf', 10))).
 * Usa solo la libreria spring-security-crypto, non Spring Security completo.
 */
@Service
public class PasswordService {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

    public String encode(String password) {
        return encoder.encode(password);
    }

    public boolean matches(String password, String salvata) {
        if (salvata == null || salvata.isBlank()) {
            return false;
        }
        return encoder.matches(password, salvata);
    }
}
