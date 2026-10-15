import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { MembroAggiunto, MiaSquadra, RuoloSquadra, SquadraDettaglio } from '../models/squadra';
import { AuthService } from './auth';
import { RITARDO_MOCK } from './mock-db';

@Injectable({ providedIn: 'root' })
export class SquadreService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // get /api/squadre/mie
  getMie(): Observable<MiaSquadra[]> {
    if (!environment.useMock) {
      return this.http.get<MiaSquadra[]>(`${environment.apiUrl}/squadre/mie`);
    }
    return this.http.get<MiaSquadra[]>('mock/squadre-mie.json').pipe(delay(RITARDO_MOCK));
  }

  getSquadra(id: number): Observable<SquadraDettaglio> {
    if (!environment.useMock) {
      return this.http.get<SquadraDettaglio>(`${environment.apiUrl}/squadre/${id}`);
    }
    const io = this.auth.utente();
    return of<SquadraDettaglio>({
      id,
      nome: '',
      membri: [{ idUtente: io?.id ?? 0, nickname: io?.nickname ?? '', ruoloSquadra: 'capo_squadra' }]
    }).pipe(delay(RITARDO_MOCK));
  }

  crea(nome: string): Observable<SquadraDettaglio> {
    if (!environment.useMock) {
      return this.http.post<SquadraDettaglio>(`${environment.apiUrl}/squadre`, { nome });
    }
    const io = this.auth.utente();
    return of<SquadraDettaglio>({
      id: Date.now(),
      nome,
      membri: [{ idUtente: io?.id ?? 0, nickname: io?.nickname ?? '', ruoloSquadra: 'capo_squadra' }]
    }).pipe(delay(RITARDO_MOCK));
  }

  aggiungiMembro(idSquadra: number, nickname: string, ruoloSquadra: RuoloSquadra): Observable<MembroAggiunto> {
    if (!environment.useMock) {
      return this.http.post<MembroAggiunto>(`${environment.apiUrl}/squadre/${idSquadra}/membri`, { nickname, ruoloSquadra });
    }
    return of<MembroAggiunto>({ idSquadra, idUtente: Date.now(), nickname, ruoloSquadra }).pipe(delay(RITARDO_MOCK));
  }

  rimuoviMembro(idSquadra: number, idUtente: number): Observable<void> {
    if (!environment.useMock) {
      return this.http.delete<void>(`${environment.apiUrl}/squadre/${idSquadra}/membri/${idUtente}`);
    }
    return of(undefined).pipe(delay(RITARDO_MOCK));
  }
}
