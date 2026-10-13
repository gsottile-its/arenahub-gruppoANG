package com.arenahub.Controller;

import com.arenahub.dto.request.ConfermaRequest;
import com.arenahub.dto.request.IscrizioneRequest;
import com.arenahub.dto.response.ConfermaResponse;
import com.arenahub.dto.response.IscrizioneResponse;
import com.arenahub.dto.response.IscrizioniPage;
import com.arenahub.dto.response.RitiroResponse;
import com.arenahub.security.UtenteLoggato;
import com.arenahub.Service.IscrizioneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import com.arenahub.security.SoloAdmin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class IscrizioneController {

    private final IscrizioneService iscrizioneService;

    @PostMapping("/tornei/{id}/iscrizioni")
    @ResponseStatus(HttpStatus.CREATED)
    public IscrizioneResponse iscrivi(@PathVariable Long id,
                                      @RequestBody(required = false) IscrizioneRequest richiesta,
                                      UtenteLoggato utente) {
        return iscrizioneService.iscrivi(id, richiesta, utente);
    }

    @GetMapping("/tornei/{id}/iscrizioni")
    @SoloAdmin
    public IscrizioniPage elencoIscritti(@PathVariable Long id,
                                         @RequestParam(required = false) String stato,
                                         @RequestParam(defaultValue = "1") int pagina) {
        return iscrizioneService.elenco(id, stato, pagina);
    }

    @PatchMapping("/iscrizioni/{id}")
    @SoloAdmin
    public ConfermaResponse conferma(@PathVariable Long id,
                                     @Valid @RequestBody ConfermaRequest richiesta) {
        return iscrizioneService.conferma(id, richiesta.stato());
    }

    @DeleteMapping("/iscrizioni/{id}")
    public RitiroResponse ritira(@PathVariable Long id,
                                 UtenteLoggato utente) {
        return iscrizioneService.ritira(id, utente);
    }
}
