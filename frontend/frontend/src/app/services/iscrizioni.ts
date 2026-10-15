import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, forkJoin, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { RispostaDisiscrizione, RispostaIscrizione } from '../models/torneo';
import { AuthService } from './auth';
import { TorneiService } from './tornei';
import { MockDb, RITARDO_MOCK, adessoIso, erroreMock } from './mock-db';

@Injectable({ providedIn: 'root' })
export class IscrizioniService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private tornei = inject(TorneiService);
  private mockDb = inject(MockDb);

  // post /api/tornei/{id}/iscrizioni
  iscriviti(idTorneo: number, idSquadra: number | null): Observable<RispostaIscrizione> {
    const corpo = idSquadra !== null ? { idSquadra } : {};
    if (!environment.useMock) {
      return this.http.post<RispostaIscrizione>(`${environment.apiUrl}/tornei/${idTorneo}/iscrizioni`, corpo);
    }

    return forkJoin([this.tornei.getTorneo(idTorneo), this.tornei.listaMock()]).pipe(
      switchMap(([t, tutti]) => {
        if (t.stato !== 'iscrizioni_aperte') return erroreMock(422, { errore: 'Le iscrizioni non sono aperte' });
        if (t.miaIscrizione && t.miaIscrizione.stato !== 'ritirata') return erroreMock(409, { errore: 'Già iscritto a questo torneo' });
        if (t.giocatoriPerSquadra > 1 && idSquadra === null) {
          return erroreMock(422, { errore: 'Questo torneo è a squadre: scegli la squadra da iscrivere' });
        }

        // limite: contano le iscrizioni non ritirate a tornei non conclusi né annullati
        const limite = this.mockDb.limiteTornei();
        const attive = tutti.filter(c =>
          c.mioStato !== null && c.mioStato !== 'ritirata' && c.stato !== 'concluso' && c.stato !== 'annullato'
        ).length;
        if (attive >= limite) {
          return erroreMock(422, { errore: `Hai raggiunto il limite di ${limite} tornei`, limite });
        }

        const pieno = t.iscritti >= t.postiMax;
        const squadra = idSquadra === 5 ? { id: 5, nome: 'Team Alpha' } : null;
        const iscrizione = {
          id: this.mockDb.nuovoId(),
          stato: pieno ? 'lista_attesa' as const : 'in_attesa' as const,
          squadra,
          posizioneAttesa: pieno ? 1 : null
        };
        this.mockDb.iscrizioni.update(tutte => ({ ...tutte, [idTorneo]: iscrizione }));

        const utente = this.auth.utente();
        const risposta: RispostaIscrizione = {
          ...iscrizione,
          idTorneo,
          utente: squadra ? null : utente && { id: utente.id, nickname: utente.nickname },
          dataIscrizione: adessoIso()
        };
        return of(risposta).pipe(delay(RITARDO_MOCK));
      })
    );
  }

  // delete /api/iscrizioni/{id} (idtorneo serve solo ai mock)
  disiscriviti(idIscrizione: number, idTorneo: number): Observable<RispostaDisiscrizione> {
    if (!environment.useMock) {
      return this.http.delete<RispostaDisiscrizione>(`${environment.apiUrl}/iscrizioni/${idIscrizione}`);
    }
    this.mockDb.iscrizioni.update(tutte => ({ ...tutte, [idTorneo]: null }));
    return of<RispostaDisiscrizione>({ id: idIscrizione, idTorneo, stato: 'ritirata', promossa: null }).pipe(delay(RITARDO_MOCK));
  }
}
