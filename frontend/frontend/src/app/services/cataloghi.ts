import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, delay, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Gioco, Piattaforma, Tipologia } from '../models/catalogo';
import { RITARDO_MOCK } from './mock-db';

@Injectable({ providedIn: 'root' })
export class CataloghiService {
  private http = inject(HttpClient);

  // get /api/tipologie
  getTipologie(): Observable<Tipologia[]> {
    const url = environment.useMock ? 'mock/tipologie.json' : `${environment.apiUrl}/tipologie`;
    return this.http.get<Tipologia[]>(url).pipe(delay(environment.useMock ? RITARDO_MOCK : 0));
  }

  // get /api/giochi?tipologia=...
  getGiochi(idTipologia: number | null = null): Observable<Gioco[]> {
    if (!environment.useMock) {
      let params = new HttpParams();
      if (idTipologia !== null) params = params.set('tipologia', idTipologia);
      return this.http.get<Gioco[]>(`${environment.apiUrl}/giochi`, { params });
    }
    return this.http.get<Gioco[]>('mock/giochi.json').pipe(
      delay(RITARDO_MOCK),
      map(giochi => (idTipologia === null ? giochi : giochi.filter(g => g.tipologia.id === idTipologia)))
    );
  }

  // get /api/piattaforme
  getPiattaforme(): Observable<Piattaforma[]> {
    const url = environment.useMock ? 'mock/piattaforme.json' : `${environment.apiUrl}/piattaforme`;
    return this.http.get<Piattaforma[]>(url).pipe(delay(environment.useMock ? RITARDO_MOCK : 0));
  }
}
