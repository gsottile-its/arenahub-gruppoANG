package com.arenahub.repository;

import com.arenahub.entity.Gioco;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GiocoRepository extends JpaRepository<Gioco, Long> {

    List<Gioco> findByTipologiaId(Long idTipologia);
}
