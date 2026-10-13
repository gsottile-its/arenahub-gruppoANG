package com.arenahub.repository;

import com.arenahub.entity.Partita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PartitaRepository extends JpaRepository<Partita, Long> {

    // Nel DB non c'e' la colonna "posizione": l'ordine delle partite di un round
    // e' quello di creazione, cioe' l'ordine degli id.
    List<Partita> findByTorneoIdOrderByTurnoAscIdAsc(Long idTorneo);

    List<Partita> findByTorneoIdAndTurnoOrderByIdAsc(Long idTorneo, Integer turno);

    boolean existsByTorneoId(Long idTorneo);

    @Query("select max(p.turno) from Partita p where p.torneo.id = :idTorneo")
    Integer turnoMassimo(@Param("idTorneo") Long idTorneo);
}
