package com.arenahub.dto.request;

import java.time.LocalDateTime;

/** dataPartita facoltativa: se manca si usa dataInizio del torneo. */
public record TabelloneRequest(LocalDateTime dataPartita) {
}
