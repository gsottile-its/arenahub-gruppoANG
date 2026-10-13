package com.arenahub.dto.response;

import java.util.List;

public record TabelloneResponse(Long idTorneo, Integer round, Integer partiteCreate, List<PartitaCreata> partite) {

    public record PartitaCreata(Long id, Long iscrizioneA, Long iscrizioneB) {
    }
}
