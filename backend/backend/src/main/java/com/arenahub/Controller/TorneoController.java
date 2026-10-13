package com.arenahub.Controller;

import com.arenahub.security.Pubblico;
import com.arenahub.dto.request.StatoRequest;
import com.arenahub.dto.request.TorneoRequest;
import com.arenahub.dto.request.TorneoUpdateRequest;
import com.arenahub.dto.response.ImmagineResponse;
import com.arenahub.dto.response.StatoResponse;
import com.arenahub.dto.response.TorneoCardPage;
import com.arenahub.dto.response.TorneoCreatoResponse;
import com.arenahub.dto.response.TorneoDettaglioResponse;
import com.arenahub.security.UtenteLoggato;
import com.arenahub.Service.ImmagineService;
import com.arenahub.Service.TorneoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import com.arenahub.security.SoloAdmin;
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

    @Pubblico
    @GetMapping
    public TorneoCardPage elenco(@RequestParam(required = false) String stato,
                                 @RequestParam(required = false) String iscritto,
                                 @RequestParam(defaultValue = "1") int pagina,
                                 UtenteLoggato utente) {
        return torneoService.elenco(stato, iscritto, pagina, utente);
    }

    @Pubblico
    @GetMapping("/{id}")
    public TorneoDettaglioResponse dettaglio(@PathVariable Long id,
                                             UtenteLoggato utente) {
        return torneoService.dettaglio(id, utente);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @SoloAdmin
    public TorneoCreatoResponse crea(@Valid @RequestBody TorneoRequest richiesta,
                                     UtenteLoggato utente) {
        return torneoService.crea(richiesta, utente.id());
    }

    @PutMapping("/{id}")
    @SoloAdmin
    public TorneoDettaglioResponse modifica(@PathVariable Long id,
                                            @Valid @RequestBody TorneoUpdateRequest richiesta) {
        return torneoService.modifica(id, richiesta);
    }

    @PatchMapping("/{id}/stato")
    @SoloAdmin
    public StatoResponse cambiaStato(@PathVariable Long id,
                                     @Valid @RequestBody StatoRequest richiesta) {
        return torneoService.cambiaStato(id, richiesta.stato());
    }

    @PostMapping(path = "/{id}/immagine", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @SoloAdmin
    public ImmagineResponse caricaImmagine(@PathVariable Long id,
                                           @RequestParam("file") MultipartFile file) {
        return immagineService.carica(id, file);
    }
}
