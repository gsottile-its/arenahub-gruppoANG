package com.example.backend.service;

import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.request.RegistrazioneRequest;
import com.example.backend.dto.response.LoginResponse;
import com.example.backend.dto.response.UtenteResponse;
import com.example.backend.entity.Utente;
import com.example.backend.entity.enums.RuoloUtente;
import com.example.backend.exception.ApiException;
import com.example.backend.repository.UtenteRepository;
import com.example.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import com.example.backend.security.PasswordService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final UtenteRepository utenteRepository;
    private final PasswordService passwordEncoder;
    private final JwtService jwtService;

    public UtenteResponse registra(RegistrazioneRequest r) {
        if (utenteRepository.existsByEmail(r.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email già registrata", "email");
        }
        if (utenteRepository.existsByNickname(r.nickname())) {
            throw new ApiException(HttpStatus.CONFLICT, "Nickname già in uso", "nickname");
        }
        Utente u = new Utente();
        u.setEmail(r.email());
        u.setNickname(r.nickname());
        u.setNome(r.nome());
        u.setCognome(r.cognome());
        u.setPasswordHash(passwordEncoder.encode(r.password()));
        u.setRuolo(RuoloUtente.utente);
        return UtenteResponse.da(utenteRepository.save(u));
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest r) {
        Utente u = utenteRepository.findByEmail(r.email())
                .filter(x -> passwordEncoder.matches(r.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email o password non corretti"));
        return new LoginResponse(jwtService.creaToken(u),
                new LoginResponse.UtenteSintesi(u.getId(), u.getNickname(), u.getRuolo()));
    }

    @Transactional(readOnly = true)
    public UtenteResponse me(Integer idUtente) {
        Utente u = utenteRepository.findById(idUtente)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Autenticazione richiesta"));
        return UtenteResponse.da(u);
    }
}
