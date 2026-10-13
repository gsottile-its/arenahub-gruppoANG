package com.arenahub.dto.request;

import java.time.LocalDateTime;

/** dataPartita facoltativa: se manca le partite restano senza data. */
public record TabelloneRequest(LocalDateTime dataPartita) {
}
