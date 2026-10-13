package com.arenahub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class MembroSquadraId implements Serializable {

    @Column(name = "fk_squadra")
    private Long idSquadra;

    @Column(name = "fk_utente")
    private Long idUtente;
}
