package com.arenahub.repository;

import com.arenahub.entity.Squadra;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SquadraRepository extends JpaRepository<Squadra, Long> {

    boolean existsByNome(String nome);
}
