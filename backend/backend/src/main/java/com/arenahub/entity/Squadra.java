package com.arenahub.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "squadra")
@Getter
@Setter
@NoArgsConstructor
public class Squadra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_squadra")
    private Long id;

    private String nome;

}
