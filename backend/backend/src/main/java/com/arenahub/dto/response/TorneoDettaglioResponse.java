package com.arenahub.dto.response;

import com.arenahub.entity.enums.IscrizioneStato;
import com.arenahub.entity.enums.TorneoStato;

import java.time.LocalDateTime;
import java.util.List;

public record TorneoDettaglioResponse(
        Integer id,
        String nome,
        String descrizione,
        String regolamento,
        String urlImmagine,
        GiocoSintesi gioco,
        List<PiattaformaResponse> piattaforme,
        Integer giocatoriPerSquadra,
        Integer postiMax,
        long iscritti,
        String premio,
        LocalDateTime aperturaIscrizioni,
        LocalDateTime chiusuraIscrizioni,
        LocalDateTime dataInizio,
        LocalDateTime dataFine,
        TorneoStato stato,
        UtenteBreve organizzatore,
        MiaIscrizione miaIscrizione,
        Boolean salvato) {

    public record GiocoSintesi(Integer id, String nome, String tipologia) {
    }

    public record MiaIscrizione(Integer id, IscrizioneStato stato, SquadraBreve squadra, Integer posizioneAttesa) {
    }
}
