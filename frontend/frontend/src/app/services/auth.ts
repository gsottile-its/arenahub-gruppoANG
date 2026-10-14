import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { DatiProfilo, DatiRegistrazione, RispostaLogin, Utente, UtenteLoggato } from '../models/utente';
import { EMAIL_ADMIN, EMAIL_PROVA, MockDb, PASSWORD_ADMIN, PASSWORD_PROVA, RITARDO_MOCK, erroreMock } from './mock-db';

// solo per i mock: l'account admin di prova
const ADMIN_MOCK: Utente = { id: 1, nickname: 'admin', nome: 'Admin', cognome: 'ArenaHub', email: EMAIL_ADMIN, ruolo: 'admin' };

export const CHIAVE_TOKEN = 'arenahub_token';
const CHIAVE_UTENTE = 'arenahub_utente';

function leggi(chiave: string): string | null {
  try { return localStorage.getItem(chiave); } catch { return null; }
}
function scrivi(chiave: string, valore: string | null) {
  try {
    if (valore === null) localStorage.removeItem(chiave);
    else localStorage.setItem(chiave, valore);
  } catch {}
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private mockDb = inject(MockDb);

  readonly utente = signal<UtenteLoggato | null>(JSON.parse(leggi(CHIAVE_UTENTE) ?? 'null'));
  readonly loggato = computed(() => this.utente() !== null);
  readonly admin = computed(() => this.utente()?.ruolo === 'admin');

  // post /api/auth/login
  login(email: string, password: string): Observable<RispostaLogin> {
    const chiamata = environment.useMock
      ? this.http.get<RispostaLogin>('mock/login.json').pipe(
          delay(RITARDO_MOCK),
          switchMap(risposta => {
            if (email === EMAIL_PROVA && password === PASSWORD_PROVA) return of(risposta);
            if (email === EMAIL_ADMIN && password === PASSWORD_ADMIN) {
              return of({ token: 'token-finto-admin', utente: { id: ADMIN_MOCK.id, nickname: ADMIN_MOCK.nickname, ruolo: ADMIN_MOCK.ruolo } });
            }
            return erroreMock(401, { errore: 'Email o password non corretti' });
          })
        )
      : this.http.post<RispostaLogin>(`${environment.apiUrl}/auth/login`, { email, password });

    return chiamata.pipe(
      tap(risposta => {
        scrivi(CHIAVE_TOKEN, risposta.token);
        this.impostaUtente(risposta.utente);
      })
    );
  }

  // il logout si fa cancellando il token
  logout() {
    scrivi(CHIAVE_TOKEN, null);
    this.impostaUtente(null);
  }

  // post /api/auth/registrazione
  registrazione(dati: DatiRegistrazione): Observable<Utente> {
    if (!environment.useMock) {
      return this.http.post<Utente>(`${environment.apiUrl}/auth/registrazione`, dati);
    }

    if (dati.email === EMAIL_PROVA) return erroreMock(409, { errore: 'Email già registrata', campo: 'email' });
    if (dati.nickname === 'lubaba') return erroreMock(409, { errore: 'Nickname già in uso', campo: 'nickname' });
    return this.http.get<Utente>('mock/registrazione.json').pipe(
      delay(RITARDO_MOCK),
      map(risposta => ({ ...risposta, email: dati.email, nickname: dati.nickname, nome: dati.nome, cognome: dati.cognome }))
    );
  }

  // get /api/auth/me
  me(): Observable<Utente> {
    if (!environment.useMock) {
      return this.http.get<Utente>(`${environment.apiUrl}/auth/me`);
    }
    return this.http.get<Utente>('mock/me.json').pipe(
      delay(RITARDO_MOCK),
      map(risposta => (this.admin() ? ADMIN_MOCK : this.mockDb.profilo() ?? risposta))
    );
  }

  // put /api/utenti/me (solo i campi cambiati)
  aggiornaProfilo(campiCambiati: DatiProfilo): Observable<Utente> {
    const chiamata = environment.useMock
      ? this.me().pipe(
          switchMap(attuale => {
            if (campiCambiati.nickname === 'admin') {
              return erroreMock(409, { errore: 'Nickname già in uso', campo: 'nickname' });
            }
            const { password, ...altriCampi } = campiCambiati;
            const aggiornato: Utente = { ...attuale, ...altriCampi };
            this.mockDb.profilo.set(aggiornato);
            return of(aggiornato);
          })
        )
      : this.http.put<Utente>(`${environment.apiUrl}/utenti/me`, campiCambiati);

    return chiamata.pipe(
      tap(utente => this.impostaUtente({ id: utente.id, nickname: utente.nickname, ruolo: utente.ruolo }))
    );
  }

  private impostaUtente(utente: UtenteLoggato | null) {
    this.utente.set(utente);
    scrivi(CHIAVE_UTENTE, utente ? JSON.stringify(utente) : null);
  }
}
