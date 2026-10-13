package com.arenahub.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tipologia_gioco")
@Getter
@Setter
@NoArgsConstructor
public class TipologiaGioco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipologia")
    private Long id;

    private String nome;
}
