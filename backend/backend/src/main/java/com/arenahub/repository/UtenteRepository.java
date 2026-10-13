package com.arenahub.repository;

import com.arenahub.entity.Utente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtenteRepository extends JpaRepository<Utente, Long> {

    Optional<Utente> findByEmail(String email);

    Optional<Utente> findByNickname(String nickname);

    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByNicknameAndIdNot(String nickname, Long id);
}
