package com.arenahub.dto.response;

import com.arenahub.entity.enums.IscrizioneStato;

public record ConfermaResponse(Integer id, Integer idTorneo, IscrizioneStato stato) {
}
