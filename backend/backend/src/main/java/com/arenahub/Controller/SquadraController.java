package com.arenahub.Controller;

import com.arenahub.dto.request.MembroRequest;
import com.arenahub.dto.request.SquadraRequest;
import com.arenahub.dto.response.MembroResponse;
import com.arenahub.dto.response.SquadraMiaResponse;
import com.arenahub.dto.response.SquadraResponse;
import com.arenahub.security.UtenteLoggato;
import com.arenahub.service.SquadraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/squadre")
@RequiredArgsConstructor
public class SquadraController {

    private final SquadraService squadraService;

    @GetMapping("/mie")
    public List<SquadraMiaResponse> mie(@AuthenticationPrincipal UtenteLoggato utente) {
        return squadraService.mie(utente.id());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SquadraResponse crea(@Valid @RequestBody SquadraRequest richiesta,
                                @AuthenticationPrincipal UtenteLoggato utente) {
        return squadraService.crea(richiesta, utente.id());
    }

    @PostMapping("/{id}/membri")
    @ResponseStatus(HttpStatus.CREATED)
    public MembroResponse aggiungiMembro(@PathVariable Integer id,
                                         @Valid @RequestBody MembroRequest richiesta,
                                         @AuthenticationPrincipal UtenteLoggato utente) {
        return squadraService.aggiungiMembro(id, richiesta, utente.id());
    }

    @DeleteMapping("/{id}/membri/{idUtente}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rimuoviMembro(@PathVariable Integer id,
                              @PathVariable Integer idUtente,
                              @AuthenticationPrincipal UtenteLoggato utente) {
        squadraService.rimuoviMembro(id, idUtente, utente.id());
    }
}
