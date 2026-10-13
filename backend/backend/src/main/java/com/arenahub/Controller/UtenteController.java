package com.arenahub.Controller;

import com.arenahub.dto.request.UtenteUpdateRequest;
import com.arenahub.dto.response.UtenteResponse;
import com.arenahub.security.UtenteLoggato;
import com.arenahub.service.UtenteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/utenti")
@RequiredArgsConstructor
public class UtenteController {

    private final UtenteService utenteService;

    @PutMapping("/me")
    public UtenteResponse aggiorna(@Valid @RequestBody UtenteUpdateRequest richiesta,
                                   @AuthenticationPrincipal UtenteLoggato utente) {
        return utenteService.aggiorna(utente.id(), richiesta);
    }
}
