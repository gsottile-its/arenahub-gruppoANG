package com.arenahub.security;

import com.arenahub.entity.Utente;
import com.arenahub.entity.enums.RuoloUtente;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private final SecretKey chiave;
    private final long durataOre;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.durata-ore}") long durataOre) {
        this.chiave = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.durataOre = durataOre;
    }

    public String creaToken(Utente utente) {
        Date ora = new Date();
        return Jwts.builder()
                .subject(String.valueOf(utente.getId()))
                .claim("nickname", utente.getNickname())
                .claim("ruolo", utente.getRuolo().name())
                .issuedAt(ora)
                .expiration(new Date(ora.getTime() + durataOre * 3_600_000L))
                .signWith(chiave)
                .compact();
    }

    public Optional<UtenteLoggato> leggiToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(chiave)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(new UtenteLoggato(
                    Long.valueOf(claims.getSubject()),
                    claims.get("nickname", String.class),
                    RuoloUtente.valueOf(claims.get("ruolo", String.class))));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
