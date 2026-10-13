package com.arenahub.repository;

import com.arenahub.entity.Iscrizione;
import com.arenahub.entity.enums.IscrizioneStato;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface IscrizioneRepository extends JpaRepository<Iscrizione, Long> {

    long countByTorneoIdAndStatoIn(Long idTorneo, Collection<IscrizioneStato> stati);

    Optional<Iscrizione> findFirstByTorneoIdAndStatoOrderByDataIscrizioneAscIdAsc(
            Long idTorneo, IscrizioneStato stato);

    long countByTorneoIdAndStatoAndIdLessThanEqual(Long idTorneo, IscrizioneStato stato, Long id);

    boolean existsByTorneoIdAndUtenteIdAndStatoNot(Long idTorneo, Long idUtente, IscrizioneStato stato);

    boolean existsByTorneoIdAndSquadraIdAndStatoNot(Long idTorneo, Long idSquadra, IscrizioneStato stato);

    boolean existsByTorneoIdAndStatoNot(Long idTorneo, IscrizioneStato stato);

    boolean existsBySquadraIdAndStatoNot(Long idSquadra, IscrizioneStato stato);

    List<Iscrizione> findByTorneoIdAndStato(Long idTorneo, IscrizioneStato stato);

    Page<Iscrizione> findByTorneoIdAndStato(Long idTorneo, IscrizioneStato stato, Pageable pageable);

    Page<Iscrizione> findByTorneoIdAndStatoNot(Long idTorneo, IscrizioneStato stato, Pageable pageable);

    @Query("""
            select i from Iscrizione i
            where i.torneo.id = :idTorneo
              and i.stato <> :esclusa
              and (i.utente.id = :idUtente
                   or i.squadra.id in (select m.squadra.id from MembroSquadra m where m.utente.id = :idUtente))
            order by i.id
            """)
    List<Iscrizione> trovaDiUtenteEscluso(@Param("idTorneo") Long idTorneo,
                                          @Param("idUtente") Long idUtente,
                                          @Param("esclusa") IscrizioneStato esclusa);

    // Lo stato e' un enum di PostgreSQL: lo passo come parametro invece di scriverlo nella query.
    default List<Iscrizione> trovaAttiveDiUtente(Long idTorneo, Long idUtente) {
        return trovaDiUtenteEscluso(idTorneo, idUtente, IscrizioneStato.ritirata);
    }
}
