package com.arenahub.dto.response;

import java.util.List;

public record TabelloneResponse(Integer idTorneo, Integer round, Integer partiteCreate, List<PartitaCreata> partite) {

    public record PartitaCreata(Integer id, Integer iscrizioneA, Integer iscrizioneB) {
    }
}
