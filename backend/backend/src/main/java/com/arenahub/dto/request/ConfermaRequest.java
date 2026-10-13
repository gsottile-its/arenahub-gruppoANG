package com.arenahub.dto.request;

import com.arenahub.entity.enums.IscrizioneStato;
import jakarta.validation.constraints.NotNull;

public record ConfermaRequest(@NotNull IscrizioneStato stato) {
}
