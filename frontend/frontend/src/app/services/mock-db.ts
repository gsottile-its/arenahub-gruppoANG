import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, switchMap } from 'rxjs';
import { IscrizioneAdmin, StatoIscrizione, TorneoCard, TorneoDettaglio } from '../models/torneo';
import { Utente } from '../models/utente';

// solo per i mock: ricorda iscrizioni e profilo finché il sito resta aperto
export const RITARDO_MOCK = 300;

export const EMAIL_PROVA = 'lubaba@mail.it';
export const PASSWORD_PROVA = 'miao1234';
export const EMAIL_ADMIN = 'admin@mail.it';
export const PASSWORD_ADMIN = 'admin1234';

export interface IscrizioneMock {
  id: number;
  stato: StatoIscrizione;
  squadra: { id: number; nome: string } | null;
  posizioneAttesa: number | null;
}

function occupaPosto(stato: StatoIscrizione | null | undefined): boolean {
  return stato === 'in_attesa' || stato === 'confermata';
}

export function erroreMock(status: number, corpo: object): Observable<never> {
  return timer(RITARDO_MOCK).pipe(
    switchMap(() => throwError(() => new HttpErrorResponse({ status, error: corpo })))
  );
}

export function paginaMock<T>(lista: T[], pagina: number, perPagina: number) {
  const pagineTotali = Math.max(1, Math.ceil(lista.length / perPagina));
  const inizio = (pagina - 1) * perPagina;
  return { pagina, pagineTotali, elementi: lista.slice(inizio, inizio + perPagina) };
}

export function adessoIso(): string {
  const d = new Date();
  const due = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${due(d.getMonth() + 1)}-${due(d.getDate())}T${due(d.getHours())}:${due(d.getMinutes())}:${due(d.getSeconds())}`;
}

@Injectable({ providedIn: 'root' })
export class MockDb {


  readonly iscrizioni = signal<Record<number, IscrizioneMock | null>>({});

  readonly profilo = signal<Utente | null>(null);

  // area admin: tornei creati o modificati, iscritti visti dall'admin e tabelloni generati
  readonly tornei = signal<Record<number, TorneoDettaglio>>({});
  readonly iscritti = signal<Record<number, IscrizioneAdmin[]>>({});
  readonly tabelloni = signal<Record<number, boolean>>({});

  private ultimoId = 100;
  nuovoId(): number {
    return ++this.ultimoId;
  }

  applicaACard(t: TorneoCard): TorneoCard {
    const modificato = this.tornei()[t.id];
    const risultato = modificato ? { ...dettaglioACard(modificato), mioStato: t.mioStato } : { ...t };

    if (t.id in this.iscrizioni()) {
      const nuovoStato = this.iscrizioni()[t.id]?.stato ?? null;
      risultato.iscritti = risultato.iscritti - (occupaPosto(t.mioStato) ? 1 : 0) + (occupaPosto(nuovoStato) ? 1 : 0);
      risultato.mioStato = nuovoStato;
    }
    return risultato;
  }

  applicaADettaglio(t: TorneoDettaglio): TorneoDettaglio {
    const modificato = this.tornei()[t.id];
    const risultato = modificato ? { ...modificato, miaIscrizione: t.miaIscrizione } : { ...t };

    if (t.id in this.iscrizioni()) {
      const nuova = this.iscrizioni()[t.id];
      risultato.iscritti = risultato.iscritti
        - (occupaPosto(t.miaIscrizione?.stato) ? 1 : 0)
        + (occupaPosto(nuova?.stato) ? 1 : 0);
      risultato.miaIscrizione = nuova ? { ...nuova } : null;
    }
    return risultato;
  }
}

// la card è un riassunto del dettaglio, con gli stessi dati del contratto
export function dettaglioACard(t: TorneoDettaglio): TorneoCard {
  return {
    id: t.id,
    nome: t.nome,
    urlImmagine: t.urlImmagine,
    gioco: t.gioco.nome,
    piattaforme: t.piattaforme.map(p => p.nome),
    giocatoriPerSquadra: t.giocatoriPerSquadra,
    postiMax: t.postiMax,
    iscritti: t.iscritti,
    stato: t.stato,
    mioStato: t.miaIscrizione?.stato ?? null
  };
}
