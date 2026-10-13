package com.arenahub.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "gioco")
@Getter
@Setter
@NoArgsConstructor
public class Gioco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gioco")
    private Long id;

    private String nome;

    private String descrizione;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_tipologia")
    private TipologiaGioco tipologia;
}
