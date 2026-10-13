package com.arenahub.Service;

import com.example.backend.dto.response.ImmagineResponse;
import com.example.backend.entity.Torneo;
import com.example.backend.exception.ApiException;
import com.example.backend.repository.TorneoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Transactional
public class ImmagineService {

    private static final long MAX_BYTE = 2L * 1024 * 1024;

    private final TorneoRepository torneoRepository;
    private final Path cartella;
    private final String baseUrl;

    public ImmagineService(TorneoRepository torneoRepository,
                           @Value("${app.upload.cartella}") String cartella,
                           @Value("${app.base-url}") String baseUrl) {
        this.torneoRepository = torneoRepository;
        this.cartella = Paths.get(cartella).toAbsolutePath().normalize();
        this.baseUrl = baseUrl;
    }

    public ImmagineResponse carica(Integer idTorneo, MultipartFile file) {
        Torneo t = torneoRepository.findById(idTorneo)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Torneo non trovato"));

        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Dati non validi");
        }
        if (file.getSize() > MAX_BYTE) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "Immagine troppo grande (max 2 MB)");
        }
        String estensione = switch (String.valueOf(file.getContentType())) {
            case "image/png" -> "png";
            case "image/jpeg" -> "jpg";
            default -> throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Formato non supportato: usa jpg o png");
        };

        try {
            Path cartellaTornei = cartella.resolve("tornei");
            Files.createDirectories(cartellaTornei);
            Files.deleteIfExists(cartellaTornei.resolve(idTorneo + ".png"));
            Files.deleteIfExists(cartellaTornei.resolve(idTorneo + ".jpg"));
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, cartellaTornei.resolve(idTorneo + "." + estensione));
            }
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Impossibile salvare l'immagine");
        }

        t.setUrlImage(baseUrl + "/uploads/tornei/" + idTorneo + "." + estensione);
        return new ImmagineResponse(t.getId(), t.getUrlImage());
    }
}
