package com.arenahub.entity;

import com.arenahub.entity.enums.RuoloSquadra;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "membro_squadra")
@Getter
@Setter
@NoArgsConstructor
public class MembroSquadra {

    @EmbeddedId
    private MembroSquadraId id = new MembroSquadraId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idSquadra")
    @JoinColumn(name = "fk_squadra")
    private Squadra squadra;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idUtente")
    @JoinColumn(name = "fk_utente")
    private Utente utente;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "ruolo_squadra", columnDefinition = "ruolo_squadra")
    private RuoloSquadra ruoloSquadra;
}
