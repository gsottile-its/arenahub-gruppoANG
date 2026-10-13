export type Ruolo = 'admin' | 'utente';

export interface UtenteLoggato {
  id: number;
  nickname: string;
  ruolo: Ruolo;
}

export interface RispostaLogin {
  token: string;
  utente: UtenteLoggato;
}

export interface Utente {
  id: number;
  nickname: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: Ruolo;
}

export interface DatiRegistrazione {
  email: string;
  nickname: string;
  nome: string;
  cognome: string;
  password: string;
}

export type DatiProfilo = Partial<DatiRegistrazione>;

export interface ErroreApi {
  errore: string;
  campo?: string;
  campi?: string[];
}
