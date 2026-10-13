package com.arenahub.Service;

import com.example.backend.dto.response.PreferitoResponse;
import com.example.backend.dto.response.TorneoCardPage;
import com.example.backend.dto.response.TorneoCardResponse;
import com.example.backend.entity.Preferito;
import com.example.backend.entity.PreferitoId;
import com.example.backend.entity.Torneo;
import com.example.backend.entity.enums.TorneoStato;
import com.example.backend.exception.ApiException;
import com.example.backend.repository.PreferitoRepository;
import com.example.backend.repository.TorneoRepository;
import com.example.backend.repository.UtenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class PreferitoService {

    private static final int DIMENSIONE_PAGINA = 10;

    private final PreferitoRepository preferitoRepository;
    private final TorneoRepository torneoRepository;
    private final UtenteRepository utenteRepository;
    private final TorneoMapper mapper;

    @Transactional(readOnly = true)
    public TorneoCardPage elenco(Integer idUtente, String stato, int pagina) {
        int p = Math.max(pagina, 1);
        Pageable pageable = PageRequest.of(p - 1, DIMENSIONE_PAGINA, Sort.by(Sort.Direction.DESC, "dataSalvataggio"));

        Page<Preferito> risultato;
        if (stato != null && !stato.isBlank()) {
            TorneoStato filtro;
            try {
                filtro = TorneoStato.valueOf(stato);
            } catch (IllegalArgumentException e) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Stato non valido");
            }
            risultato = preferitoRepository.findByUtenteIdAndTorneoStato(idUtente, filtro, pageable);
        } else {
            risultato = preferitoRepository.findByUtenteId(idUtente, pageable);
        }

        List<TorneoCardResponse> card = risultato.getContent().stream()
                .map(f -> mapper.toCard(f.getTorneo(), idUtente))
                .toList();
        return new TorneoCardPage(p, risultato.getTotalPages(), card);
    }

    public PreferitoResponse salva(Integer idUtente, Integer idTorneo) {
        Torneo t = torneoRepository.findById(idTorneo)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Torneo non trovato"));
        if (preferitoRepository.existsByUtenteIdAndTorneoId(idUtente, idTorneo)) {
            throw new ApiException(HttpStatus.CONFLICT, "Torneo già salvato");
        }
        Preferito f = new Preferito();
        f.setId(new PreferitoId(idUtente, idTorneo));
        f.setUtente(utenteRepository.getReferenceById(idUtente));
        f.setTorneo(t);
        f.setDataSalvataggio(LocalDateTime.now());
        preferitoRepository.save(f);
        return new PreferitoResponse(idTorneo, f.getDataSalvataggio());
    }

    public void rimuovi(Integer idUtente, Integer idTorneo) {
        if (!preferitoRepository.existsByUtenteIdAndTorneoId(idUtente, idTorneo)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Torneo non presente nei preferiti");
        }
        preferitoRepository.deleteByUtenteIdAndTorneoId(idUtente, idTorneo);
    }
}
