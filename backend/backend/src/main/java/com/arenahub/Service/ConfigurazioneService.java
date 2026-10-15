package com.arenahub.Service;

import com.arenahub.dto.response.LimiteAggiornatoResponse;
import com.arenahub.dto.response.LimiteIscrizioniResponse;
import com.arenahub.entity.Configurazione;
import com.arenahub.exception.ApiException;
import com.arenahub.repository.ConfigurazioneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class ConfigurazioneService {

    private static final String MAX_TORNEI_PER_UTENTE = "max_tornei_per_utente";

    private final ConfigurazioneRepository repository;

    /** Usato da IscrizioneService per il controllo. */
    @Transactional(readOnly = true)
    public int maxTorneiPerUtente() {
        return Integer.parseInt(trova().getValore());
    }

    @Transactional(readOnly = true)
    public LimiteIscrizioniResponse leggiLimite() {
        return new LimiteIscrizioniResponse(maxTorneiPerUtente());
    }

    public LimiteAggiornatoResponse aggiornaLimite(Integer nuovo) {
        if (nuovo < 1) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Il limite deve essere un intero maggiore o uguale a 1");
        }
        Configurazione c = trova();
        c.setValore(String.valueOf(nuovo));
        c.setDataModifica(LocalDateTime.now());
        return new LimiteAggiornatoResponse(nuovo, c.getDataModifica());
    }

    private Configurazione trova() {
        return repository.findById(MAX_TORNEI_PER_UTENTE)
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Configurazione mancante: esegui l'insert iniziale"));
    }
}