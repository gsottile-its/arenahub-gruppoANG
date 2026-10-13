package com.arenahub.repository;

import com.arenahub.entity.MembroSquadra;
import com.arenahub.entity.MembroSquadraId;
import com.arenahub.entity.enums.RuoloSquadra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembroSquadraRepository extends JpaRepository<MembroSquadra, MembroSquadraId> {

    List<MembroSquadra> findByUtenteId(Long idUtente);

    List<MembroSquadra> findBySquadraId(Long idSquadra);

    long countBySquadraId(Long idSquadra);

    boolean existsBySquadraIdAndUtenteId(Long idSquadra, Long idUtente);

    Optional<MembroSquadra> findBySquadraIdAndUtenteId(Long idSquadra, Long idUtente);

    // Nel DB la squadra non ha fk_creatore: il creatore e' il membro con ruolo capo_squadra.
    long countByUtenteIdAndRuoloSquadra(Long idUtente, RuoloSquadra ruoloSquadra);
}
