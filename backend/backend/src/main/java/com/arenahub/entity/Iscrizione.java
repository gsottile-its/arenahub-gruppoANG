package com.arenahub.entity;

import com.arenahub.entity.enums.IscrizioneStato;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "iscrizione")
@Getter
@Setter
@NoArgsConstructor
public class Iscrizione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_iscrizione")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_torneo")
    private Torneo torneo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_squadra")
    private Squadra squadra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_utente")
    private Utente utente;

    @Column(name = "data_iscrizione")
    private LocalDateTime dataIscrizione;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "stato", columnDefinition = "stato_iscrizione")
    private IscrizioneStato stato;

    public String nomePartecipante() {
        return squadra != null ? squadra.getNome() : utente.getNickname();
    }
}
