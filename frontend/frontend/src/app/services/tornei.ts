import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, delay, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginaTornei, StatoTorneo, Tabellone, TorneoCard, TorneoDettaglio } from '../models/torneo';
import { AuthService } from './auth';
import { MockDb, RITARDO_MOCK, dettaglioACard, erroreMock, paginaMock } from './mock-db';

// contratto: 10 per pagina. nel mock 12: da allineare col backend
export const TORNEI_PER_PAGINA = 12;

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
    // i tornei creati dall'admin esistono solo in memoria
    const creato = this.mockDb.tornei()[id];
    const sorgente = creato && id > 1000
      ? of(creato).pipe(delay(RITARDO_MOCK))
      : this.http.get<TorneoDettaglio>(`mock/tornei/${id}.json`).pipe(delay(RITARDO_MOCK));

    return sorgente.pipe(
      map(t => {
        const aggiornato = this.mockDb.applicaADettaglio(t);
        if (aggiornato.stato === 'bozza' && !this.auth.admin()) throw new Error('bozza');
        return this.auth.loggato() ? aggiornato : { ...aggiornato, miaIscrizione: null };
      }),

      catchError(() => erroreMock(404, { errore: 'Torneo non trovato' }))
    );
  }

  getPartite(idTorneo: number): Observable<Tabellone> {
    if (!environment.useMock) {
      return this.http.get<Tabellone>(`${environment.apiUrl}/tornei/${idTorneo}/partite`);
    }
    const turni = this.mockDb.tabelloni()[idTorneo] ?? [];
    return of<Tabellone>({ idTorneo, turni: structuredClone(turni) }).pipe(delay(RITARDO_MOCK));
  }

  listaMock(): Observable<TorneoCard[]> {
    return this.http.get<PaginaTornei>('mock/tornei.json').pipe(
      delay(RITARDO_MOCK),
      map(risposta => {
        // i tornei creati dall'admin vanno in cima, come fa il backend (ordine per id decrescente)
        const creati = Object.values(this.mockDb.tornei())
          .filter(t => t.id > 1000)
          .sort((a, b) => b.id - a.id)
          .map(t => dettaglioACard(t));
        let tornei = [...creati, ...risposta.tornei]
          .map(t => this.mockDb.applicaACard(t))
          .filter(t => t.stato !== 'bozza' || this.auth.admin());

        if (!this.auth.loggato() || this.auth.admin()) {
          tornei = tornei.map(t => ({ ...t, mioStato: null }));
        }
        return tornei;
      })
    );
  }
}
