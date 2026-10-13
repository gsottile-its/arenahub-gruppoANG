package com.arenahub.Service;

import com.arenahub.dto.response.GiocoResponse;
import com.arenahub.dto.response.PiattaformaResponse;
import com.arenahub.dto.response.TipologiaResponse;
import com.arenahub.entity.Gioco;
import com.arenahub.repository.GiocoRepository;
import com.arenahub.repository.PiattaformaRepository;
import com.arenahub.repository.TipologiaGiocoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CatalogoService {

    private final TipologiaGiocoRepository tipologiaRepository;
    private final GiocoRepository giocoRepository;
    private final PiattaformaRepository piattaformaRepository;

    public List<TipologiaResponse> tipologie() {
        return tipologiaRepository.findAll(Sort.by("id")).stream()
                .map(t -> new TipologiaResponse(t.getId(), t.getNome()))
                .toList();
    }

    public List<GiocoResponse> giochi(Long idTipologia) {
        List<Gioco> giochi = idTipologia == null
                ? giocoRepository.findAll(Sort.by("id"))
                : giocoRepository.findByTipologiaId(idTipologia);
        return giochi.stream()
                .map(g -> new GiocoResponse(g.getId(), g.getNome(), g.getDescrizione(),
                        new TipologiaResponse(g.getTipologia().getId(), g.getTipologia().getNome())))
                .toList();
    }

    public List<PiattaformaResponse> piattaforme() {
        return piattaformaRepository.findAll(Sort.by("id")).stream()
                .map(p -> new PiattaformaResponse(p.getId(), p.getNome()))
                .toList();
    }
}
