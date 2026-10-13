package com.arenahub.Controller;

import com.arenahub.security.Pubblico;
import com.arenahub.dto.response.TipologiaResponse;
import com.arenahub.Service.CatalogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Pubblico
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
