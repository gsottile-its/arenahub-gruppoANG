package com.arenahub.Controller;

import com.arenahub.Service.ConfigurazioneService;
import com.arenahub.dto.request.LimiteIscrizioniRequest;
import com.arenahub.dto.response.LimiteAggiornatoResponse;
import com.arenahub.dto.response.LimiteIscrizioniResponse;
import com.arenahub.security.Pubblico;
import com.arenahub.security.SoloAdmin;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configurazione")
@RequiredArgsConstructor
public class ConfigurazioneController {

    private final ConfigurazioneService configurazioneService;

    @Pubblico
    @GetMapping("/limite-iscrizioni")
    public LimiteIscrizioniResponse leggiLimite() {
        return configurazioneService.leggiLimite();
    }

    @SoloAdmin
    @PutMapping("/limite-iscrizioni")
    public LimiteAggiornatoResponse aggiornaLimite(@Valid @RequestBody LimiteIscrizioniRequest richiesta) {
        return configurazioneService.aggiornaLimite(richiesta.maxTorneiPerUtente());
    }
}