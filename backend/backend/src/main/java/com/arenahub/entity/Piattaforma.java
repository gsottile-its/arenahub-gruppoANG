package com.arenahub.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "piattaforma")
@Getter
@Setter
@NoArgsConstructor
public class Piattaforma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_piattaforma")
    private Long id;

    private String nome;
}
