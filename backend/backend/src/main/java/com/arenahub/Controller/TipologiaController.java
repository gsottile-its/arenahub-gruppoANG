package com.arenahub.Controller;

import com.arenahub.dto.response.TipologiaResponse;
import com.arenahub.service.CatalogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tipologie")
@RequiredArgsConstructor
public class TipologiaController {

    private final CatalogoService catalogoService;

    @GetMapping
    public List<TipologiaResponse> elenco() {
        return catalogoService.tipologie();
    }
}
