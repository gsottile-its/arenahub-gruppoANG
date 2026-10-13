package com.arenahub.dto.response;

import com.arenahub.entity.enums.PartitaStato;

import java.time.LocalDateTime;
import java.util.List;

public record PartiteResponse(Long idTorneo, List<Turno> turni) {

    public record Turno(Integer round, List<PartitaDto> partite) {
    }

    /** I partecipanti sono null finche' non sono noti; punteggi e vincitore sono null finche' la partita non e' conclusa. */
    public record PartitaDto(
            Long id,
            PartitaStato stato,
            LocalDateTime dataPartita,
            Partecipante partecipanteA,
            Integer punteggioA,
            Partecipante partecipanteB,
            Integer punteggioB,
            Long vincitore) {
    }

    public record Partecipante(Long idIscrizione, String nome) {
    }
}
