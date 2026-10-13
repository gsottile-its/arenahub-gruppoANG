package com.arenahub.Controller;

import com.arenahub.security.Pubblico;
import com.arenahub.dto.response.GiocoResponse;
import com.arenahub.Service.CatalogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Pubblico
@RestController
@RequestMapping("/api/giochi")
@RequiredArgsConstructor
public class GiocoController {

    private final CatalogoService catalogoService;

    @GetMapping
    public List<GiocoResponse> elenco(@RequestParam(required = false) Long tipologia) {
        return catalogoService.giochi(tipologia);
    }
}
