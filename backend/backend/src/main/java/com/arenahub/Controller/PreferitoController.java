package com.arenahub.Controller;

import com.arenahub.dto.request.PreferitoRequest;
import com.arenahub.dto.response.PreferitoResponse;
import com.arenahub.dto.response.TorneoCardPage;
import com.arenahub.security.UtenteLoggato;
import com.arenahub.service.PreferitoService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/preferiti")
@RequiredArgsConstructor
public class PreferitoController {

    private final PreferitoService preferitoService;

    @GetMapping
    public TorneoCardPage elenco(@RequestParam(required = false) String stato,
                                 @RequestParam(defaultValue = "1") int pagina,
                                 @AuthenticationPrincipal UtenteLoggato utente) {
        return preferitoService.elenco(utente.id(), stato, pagina);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PreferitoResponse salva(@Valid @RequestBody PreferitoRequest richiesta,
                                   @AuthenticationPrincipal UtenteLoggato utente) {
        return preferitoService.salva(utente.id(), richiesta.idTorneo());
    }

    @DeleteMapping("/{idTorneo}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rimuovi(@PathVariable Integer idTorneo,
                        @AuthenticationPrincipal UtenteLoggato utente) {
        preferitoService.rimuovi(utente.id(), idTorneo);
    }
}
