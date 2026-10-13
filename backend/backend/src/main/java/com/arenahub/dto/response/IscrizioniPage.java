package com.arenahub.dto.response;

import java.util.List;

public record IscrizioniPage(int pagina, int pagineTotali, List<IscrizioneAdminResponse> iscrizioni) {
}
