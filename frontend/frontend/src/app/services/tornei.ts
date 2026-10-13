import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, delay, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginaTornei, StatoTorneo, TorneoCard, TorneoDettaglio } from '../models/torneo';
import { AuthService } from './auth';
import { MockDb, RITARDO_MOCK, erroreMock, paginaMock } from './mock-db';

export const TORNEI_PER_PAGINA = 10;

@Injectable({ providedIn: 'root' })
export class TorneiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private mockDb = inject(MockDb);

  // get /api/tornei?stato=...&pagina=...&iscritto=me
  getTornei(stato: StatoTorneo | null, pagina = 1, soloIscritto = false): Observable<PaginaTornei> {
    if (!environment.useMock) {
      let params = new HttpParams().set('pagina', pagina);
      if (stato) params = params.set('stato', stato);
      if (soloIscritto) params = params.set('iscritto', 'me');
      return this.http.get<PaginaTornei>(`${environment.apiUrl}/tornei`, { params });
    }

    return this.listaMock().pipe(
      map(tornei => {
        if (stato) tornei = tornei.filter(t => t.stato === stato);

        if (soloIscritto) tornei = tornei.filter(t => t.mioStato !== null && t.mioStato !== 'ritirata');
        const p = paginaMock(tornei, pagina, TORNEI_PER_PAGINA);
        return { pagina: p.pagina, pagineTotali: p.pagineTotali, tornei: p.elementi };
      })
    );
  }

  // get /api/tornei/{id}
  getTorneo(id: number): Observable<TorneoDettaglio> {
    if (!environment.useMock) {
      return this.http.get<TorneoDettaglio>(`${environment.apiUrl}/tornei/${id}`);
    }
    return this.http.get<TorneoDettaglio>(`mock/tornei/${id}.json`).pipe(
      delay(RITARDO_MOCK),
      map(t => {
        const aggiornato = this.mockDb.applicaADettaglio(t);

        return this.auth.loggato() ? aggiornato : { ...aggiornato, miaIscrizione: null };
      }),

      catchError(() => erroreMock(404, { errore: 'Torneo non trovato' }))
    );
  }

  listaMock(): Observable<TorneoCard[]> {
    return this.http.get<PaginaTornei>('mock/tornei.json').pipe(
      delay(RITARDO_MOCK),
      map(risposta => {
        let tornei = risposta.tornei
          .filter(t => t.stato !== 'bozza' || this.auth.admin())
          .map(t => this.mockDb.applicaACard(t));

        if (!this.auth.loggato()) {
          tornei = tornei.map(t => ({ ...t, mioStato: null }));
        }
        return tornei;
      })
    );
  }
}
