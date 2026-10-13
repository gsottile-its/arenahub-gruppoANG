import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay } from 'rxjs';
import { environment } from '../../environments/environment';
import { MiaSquadra } from '../models/squadra';
import { RITARDO_MOCK } from './mock-db';

@Injectable({ providedIn: 'root' })
export class SquadreService {
  private http = inject(HttpClient);

  // get /api/squadre/mie
  getMie(): Observable<MiaSquadra[]> {
    if (!environment.useMock) {
      return this.http.get<MiaSquadra[]>(`${environment.apiUrl}/squadre/mie`);
    }
    return this.http.get<MiaSquadra[]>('mock/squadre-mie.json').pipe(delay(RITARDO_MOCK));
  }
}
