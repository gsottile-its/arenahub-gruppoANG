package com.arenahub.Controller;

import com.arenahub.dto.request.StatoRequest;
import com.arenahub.dto.request.TorneoRequest;
import com.arenahub.dto.request.TorneoUpdateRequest;
import com.arenahub.dto.response.ImmagineResponse;
import com.arenahub.dto.response.StatoResponse;
import com.arenahub.dto.response.TorneoCardPage;
import com.arenahub.dto.response.TorneoCreatoResponse;
import com.arenahub.dto.response.TorneoDettaglioResponse;
import com.arenahub.security.UtenteLoggato;
import com.arenahub.service.ImmagineService;
import com.arenahub.service.TorneoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tornei")
@RequiredArgsConstructor
public class TorneoController {

    private final TorneoService torneoService;
    private final ImmagineService immagineService;

    @GetMapping
    public TorneoCardPage elenco(@RequestParam(required = false) String stato,
                                 @RequestParam(required = false) String iscritto,
                                 @RequestParam(defaultValue = "1") int pagina,
                                 @AuthenticationPrincipal UtenteLoggato utente) {
        return torneoService.elenco(stato, iscritto, pagina, utente); // utente può essere null
    }

    @GetMapping("/{id}")
    public TorneoDettaglioResponse dettaglio(@PathVariable Integer id,
                                             @AuthenticationPrincipal UtenteLoggato utente) {
        return torneoService.dettaglio(id, utente);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public TorneoCreatoResponse crea(@Valid @RequestBody TorneoRequest richiesta,
                                     @AuthenticationPrincipal UtenteLoggato utente) {
        return torneoService.crea(richiesta, utente.id());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TorneoDettaglioResponse modifica(@PathVariable Integer id,
                                            @Valid @RequestBody TorneoUpdateRequest richiesta) {
        return torneoService.modifica(id, richiesta);
    }

    @PatchMapping("/{id}/stato")
    @PreAuthorize("hasRole('ADMIN')")
    public StatoResponse cambiaStato(@PathVariable Integer id,
                                     @Valid @RequestBody StatoRequest richiesta) {
        return torneoService.cambiaStato(id, richiesta.stato());
    }

    @PostMapping(path = "/{id}/immagine", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ImmagineResponse caricaImmagine(@PathVariable Integer id,
                                           @RequestParam("file") MultipartFile file) {
        return immagineService.carica(id, file);
    }
}
