package com.arenahub.dto.response;

import java.util.List;

public record TorneoCardPage(int pagina, int pagineTotali, List<TorneoCardResponse> tornei) {
}
