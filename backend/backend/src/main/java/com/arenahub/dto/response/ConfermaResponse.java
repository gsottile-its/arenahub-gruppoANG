package com.arenahub.dto.response;

import com.arenahub.entity.enums.IscrizioneStato;

public record ConfermaResponse(Long id, Long idTorneo, IscrizioneStato stato) {
}
