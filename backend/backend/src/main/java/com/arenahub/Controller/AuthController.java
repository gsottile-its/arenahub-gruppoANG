package com.arenahub.Controller;

import com.arenahub.dto.request.LoginRequest;
import com.arenahub.dto.request.RegistrazioneRequest;
import com.arenahub.dto.response.LoginResponse;
import com.arenahub.dto.response.UtenteResponse;
import com.arenahub.security.UtenteLoggato;
import com.arenahub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/registrazione")
    @ResponseStatus(HttpStatus.CREATED)
    public UtenteResponse registrazione(@Valid @RequestBody RegistrazioneRequest richiesta) {
        return authService.registra(richiesta);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest richiesta) {
        return authService.login(richiesta);
    }

    @GetMapping("/me")
    public UtenteResponse me(@AuthenticationPrincipal UtenteLoggato utente) {
        return authService.me(utente.id());
    }
}
