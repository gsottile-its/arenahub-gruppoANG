package com.arenahub.Controller;

import com.arenahub.dto.response.GiocoResponse;
import com.arenahub.service.CatalogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/giochi")
@RequiredArgsConstructor
public class GiocoController {

    private final CatalogoService catalogoService;

    @GetMapping
    public List<GiocoResponse> elenco(@RequestParam(required = false) Integer tipologia) {
        return catalogoService.giochi(tipologia);
    }
}
