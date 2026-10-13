package com.arenahub.entity;

import com.arenahub.entity.enums.TorneoStato;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "torneo")
@Getter
@Setter
@NoArgsConstructor
public class Torneo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_torneo")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_organizzatore")
    private Utente organizzatore;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_gioco")
    private Gioco gioco;

    private String nome;

    @Column(name = "max_posti")
    private Integer postiMax;

    @Column(name = "long_desc")
    private String descrizione;

    @Column(name = "data_apertura_iscrizione")
    private LocalDateTime aperturaIscrizioni;

    @Column(name = "data_fine_iscrizione")
    private LocalDateTime chiusuraIscrizioni;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "stato", columnDefinition = "stato_torneo")
    private TorneoStato stato;

    @Column(name = "giocatori_per_squadra")
    private Integer giocatoriPerSquadra;

    @Column(name = "url_image")
    private String urlImage;

    private String premio;

    @ManyToMany
    @JoinTable(name = "piattaforme_torneo",
            joinColumns = @JoinColumn(name = "fk_torneo"),
            inverseJoinColumns = @JoinColumn(name = "fk_piattaforma"))
    private Set<Piattaforma> piattaforme = new HashSet<>();
}
