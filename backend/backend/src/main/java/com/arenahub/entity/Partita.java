package com.arenahub.entity;

import com.arenahub.entity.enums.PartitaStato;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "partita")
@Getter
@Setter
@NoArgsConstructor
public class Partita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_partita")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_torneo")
    private Torneo torneo;

    @Column(name = "round")
    private Integer turno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_iscrizione_a")
    private Iscrizione iscrizioneA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_iscrizione_b")
    private Iscrizione iscrizioneB;

    @Column(name = "punteggio_a")
    private Integer punteggioA;

    @Column(name = "punteggio_b")
    private Integer punteggioB;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_vincitore")
    private Iscrizione vincitore;

    @Column(name = "data_partita")
    private LocalDateTime dataPartita;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "stato", columnDefinition = "stato_partita")
    private PartitaStato stato;
}
