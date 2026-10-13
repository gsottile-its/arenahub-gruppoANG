package com.arenahub.repository;

import com.arenahub.entity.Iscrizione;
import com.arenahub.entity.MembroSquadra;
import com.arenahub.entity.Torneo;
import com.arenahub.entity.enums.IscrizioneStato;
import com.arenahub.entity.enums.TorneoStato;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

public final class TorneoSpecs {

    private TorneoSpecs() {
    }

    public static Specification<Torneo> tutti() {
        return (root, query, cb) -> cb.conjunction();
    }

    public static Specification<Torneo> conStato(TorneoStato stato) {
        return (root, query, cb) -> cb.equal(root.get("stato"), stato);
    }

    public static Specification<Torneo> senzaBozze() {
        return (root, query, cb) -> cb.notEqual(root.get("stato"), TorneoStato.bozza);
    }

    public static Specification<Torneo> iscrittoA(Long idUtente) {
        return (root, query, cb) -> {
            Subquery<Long> squadre = query.subquery(Long.class);
            Root<MembroSquadra> m = squadre.from(MembroSquadra.class);
            squadre.select(m.get("squadra").get("id"))
                    .where(cb.equal(m.get("utente").get("id"), idUtente));

            Subquery<Long> iscrizioni = query.subquery(Long.class);
            Root<Iscrizione> i = iscrizioni.from(Iscrizione.class);
            iscrizioni.select(i.get("id")).where(
                    cb.equal(i.get("torneo"), root),
                    cb.notEqual(i.get("stato"), IscrizioneStato.ritirata),
                    cb.or(
                            cb.equal(i.get("utente").get("id"), idUtente),
                            i.get("squadra").get("id").in(squadre)));

            return cb.exists(iscrizioni);
        };
    }
}
