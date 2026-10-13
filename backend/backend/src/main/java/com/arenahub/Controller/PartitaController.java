package com.arenahub.Controller;

import com.arenahub.security.Pubblico;
import com.arenahub.dto.request.RisultatoRequest;
import com.arenahub.dto.request.TabelloneRequest;
import com.arenahub.dto.response.PartiteResponse;
import com.arenahub.dto.response.RisultatoResponse;
import com.arenahub.dto.response.TabelloneResponse;
import com.arenahub.Service.TabelloneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import com.arenahub.security.SoloAdmin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PartitaController {

    private final TabelloneService tabelloneService;

    @PostMapping("/tornei/{id}/tabellone")
    @ResponseStatus(HttpStatus.CREATED)
    @SoloAdmin
    public TabelloneResponse generaTabellone(@PathVariable Long id,
                                             @RequestBody(required = false) TabelloneRequest richiesta) {
        return tabelloneService.genera(id, richiesta);
    }

    @Pubblico
    @GetMapping("/tornei/{id}/partite")
    public PartiteResponse partite(@PathVariable Long id) {
        return tabelloneService.partite(id);
    }

    @PatchMapping("/partite/{id}/risultato")
    @SoloAdmin
    public RisultatoResponse registraRisultato(@PathVariable Long id,
                                               @Valid @RequestBody RisultatoRequest richiesta) {
        return tabelloneService.registraRisultato(id, richiesta);
    }
}
