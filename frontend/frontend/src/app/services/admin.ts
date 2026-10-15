import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, delay, forkJoin, map, of, switchMap, take } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DatiTorneo, IscrizioneAdmin, PaginaIscrizioni, RispostaConferma, RispostaDisiscrizione, RispostaImmagine,
  LimiteAggiornato, LimiteIscrizioni, RispostaStato, RispostaTabellone, StatoTorneo, TorneoCreato, TorneoDettaglio
} from '../models/torneo';
import { AuthService } from './auth';
import { CataloghiService } from './cataloghi';
import { TorneiService } from './tornei';
import { MockDb, RITARDO_MOCK, adessoIso, erroreMock, paginaMock } from './mock-db';

// transizioni ammesse dal contratto (patch /api/tornei/{id}/stato)
export const TRANSIZIONI: Record<StatoTorneo, StatoTorneo[]> = {
  bozza: ['iscrizioni_aperte', 'annullato'],
  iscrizioni_aperte: ['iscrizioni_chiuse', 'annullato'],
  iscrizioni_chiuse: ['in_corso', 'annullato'],
  in_corso: ['concluso', 'annullato'],
  concluso: [],
  annullato: []
};

// stati in cui put /api/tornei/{id} è consentito
export const STATI_MODIFICABILI: StatoTorneo[] = ['bozza', 'iscrizioni_aperte', 'iscrizioni_chiuse'];

const ISCRITTI_PER_PAGINA = 20;
const NOMI_SQUADRE = ['Team Alpha', 'Night Owls', 'Red Foxes', 'Blue Sharks', 'Neon Cats', 'Storm FC', 'Iron Wolves',
  'Pixel Kings', 'Dark Ravens', 'Golden Eagles', 'Frost Byte', 'Lava Lords', 'Green Vipers', 'Silver Ghosts', 'Ronin Squad', 'Nova Crew'];
const NOMI_UTENTI = ['marco99', 'giulia_gg', 'kenji', 'sara.pro', 'luca_x', 'davide7', 'elena.v', 'tommy', 'fede_rush',
  'ale.k', 'nicole', 'gianluca', 'chiara88', 'matteo_r', 'ilaria', 'pietro.x'];

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private cataloghi = inject(CataloghiService);
  private torneiService = inject(TorneiService);
  private mockDb = inject(MockDb);

  // post /api/tornei
  creaTorneo(dati: DatiTorneo): Observable<TorneoCreato> {
    if (!environment.useMock) {
      return this.http.post<TorneoCreato>(`${environment.apiUrl}/tornei`, dati);
    }
    if (dati.aperturaIscrizioni >= dati.chiusuraIscrizioni) {
      return erroreMock(422, { errore: "L'apertura delle iscrizioni deve essere prima della chiusura" });
    }

    return forkJoin([this.cataloghi.getGiochi(), this.cataloghi.getPiattaforme()]).pipe(
      switchMap(([giochi, piattaforme]) => {
        const gioco = giochi.find(g => g.id === dati.idGioco);
        if (!gioco) return erroreMock(404, { errore: 'Gioco non trovato' });

        const ids = Object.keys(this.mockDb.tornei()).map(Number).filter(id => id > 1000);
        const id = ids.length > 0 ? Math.max(...ids) + 1 : 1001;
        const utente = this.auth.utente();
        const nuovo: TorneoDettaglio = {
          id,
          nome: dati.nome,
          descrizione: dati.descrizione,
          urlImmagine: null,
          gioco: { id: gioco.id, nome: gioco.nome, tipologia: gioco.tipologia.nome },
          piattaforme: piattaforme.filter(p => dati.idPiattaforme.includes(p.id)),
          giocatoriPerSquadra: dati.giocatoriPerSquadra,
          postiMax: dati.postiMax,
          iscritti: 0,
          premio: dati.premio,
          aperturaIscrizioni: dati.aperturaIscrizioni,
          chiusuraIscrizioni: dati.chiusuraIscrizioni,
          stato: 'bozza',
          organizzatore: { id: utente?.id ?? 1, nickname: utente?.nickname ?? 'admin' },
          miaIscrizione: null
        };
        this.salva(nuovo);
        this.mockDb.iscritti.update(tutti => ({ ...tutti, [id]: [] }));

        return of<TorneoCreato>({
          id: nuovo.id,
          nome: nuovo.nome,
          stato: nuovo.stato,
          gioco: nuovo.gioco,
          piattaforme: nuovo.piattaforme,
          giocatoriPerSquadra: nuovo.giocatoriPerSquadra,
          postiMax: nuovo.postiMax,
          premio: nuovo.premio,
          aperturaIscrizioni: nuovo.aperturaIscrizioni,
          chiusuraIscrizioni: nuovo.chiusuraIscrizioni,
          urlImmagine: nuovo.urlImmagine
        }).pipe(delay(RITARDO_MOCK));
      })
    );
  }

  // put /api/tornei/{id} (solo i campi cambiati)
  modificaTorneo(id: number, campi: Partial<DatiTorneo>): Observable<TorneoDettaglio> {
    if (!environment.useMock) {
      return this.http.put<TorneoDettaglio>(`${environment.apiUrl}/tornei/${id}`, campi);
    }

    return forkJoin([this.torneoMock(id), this.cataloghi.getGiochi(), this.cataloghi.getPiattaforme()]).pipe(
      switchMap(([t, giochi, piattaforme]) => {
        if (!STATI_MODIFICABILI.includes(t.stato)) return erroreMock(409, { errore: 'Il torneo non è più modificabile' });

        const cambiaFormato = (campi.idGioco !== undefined && campi.idGioco !== t.gioco.id)
          || (campi.giocatoriPerSquadra !== undefined && campi.giocatoriPerSquadra !== t.giocatoriPerSquadra);
        if (cambiaFormato && t.iscritti > 0) {
          return erroreMock(409, { errore: 'Ci sono già iscrizioni: gioco e formato non sono modificabili' });
        }
        if (campi.postiMax !== undefined && campi.postiMax < t.iscritti) {
          return erroreMock(422, { errore: `Ci sono già ${t.iscritti} iscrizioni` });
        }
        const apertura = campi.aperturaIscrizioni ?? t.aperturaIscrizioni;
        const chiusura = campi.chiusuraIscrizioni ?? t.chiusuraIscrizioni;
        if (apertura >= chiusura) {
          return erroreMock(422, { errore: "L'apertura delle iscrizioni deve essere prima della chiusura" });
        }

        const gioco = campi.idGioco !== undefined ? giochi.find(g => g.id === campi.idGioco) : undefined;
        if (campi.idGioco !== undefined && !gioco) return erroreMock(404, { errore: 'Gioco non trovato' });

        const aggiornato: TorneoDettaglio = {
          ...t,
          nome: campi.nome ?? t.nome,
          descrizione: campi.descrizione !== undefined ? campi.descrizione : t.descrizione,
          premio: campi.premio !== undefined ? campi.premio : t.premio,
          postiMax: campi.postiMax ?? t.postiMax,
          giocatoriPerSquadra: campi.giocatoriPerSquadra ?? t.giocatoriPerSquadra,
          aperturaIscrizioni: apertura,
          chiusuraIscrizioni: chiusura,
          gioco: gioco ? { id: gioco.id, nome: gioco.nome, tipologia: gioco.tipologia.nome } : t.gioco,
          piattaforme: campi.idPiattaforme ? piattaforme.filter(p => campi.idPiattaforme!.includes(p.id)) : t.piattaforme
        };
        this.salva(aggiornato);
        return of(aggiornato).pipe(delay(RITARDO_MOCK));
      })
    );
  }

  // patch /api/tornei/{id}/stato
  cambiaStato(id: number, stato: StatoTorneo): Observable<RispostaStato> {
    if (!environment.useMock) {
      return this.http.patch<RispostaStato>(`${environment.apiUrl}/tornei/${id}/stato`, { stato });
    }

    return this.torneoMock(id).pipe(
      switchMap(t => {
        if (!TRANSIZIONI[t.stato].includes(stato)) {
          return erroreMock(422, { errore: `Impossibile passare da ${t.stato} a ${stato}` });
        }
        if (stato === 'in_corso' && !this.mockDb.tabelloni()[id]) {
          return erroreMock(422, { errore: 'Genera il tabellone prima di avviare il torneo' });
        }
        this.salva({ ...t, stato });
        return of<RispostaStato>({ id, stato });
      })
    );
  }

  // post /api/tornei/{id}/immagine (multipart, campo "file")
  caricaImmagine(id: number, file: File): Observable<RispostaImmagine> {
    if (!environment.useMock) {
      const corpo = new FormData();
      corpo.append('file', file);
      return this.http.post<RispostaImmagine>(`${environment.apiUrl}/tornei/${id}/immagine`, corpo);
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return erroreMock(415, { errore: 'Formato non supportato: usa jpg o png' });
    }
    if (file.size > 2 * 1024 * 1024) {
      return erroreMock(413, { errore: 'Immagine troppo grande (max 2 MB)' });
    }

    return this.torneoMock(id).pipe(
      switchMap(t => {
        const urlImmagine = URL.createObjectURL(file);
        this.salva({ ...t, urlImmagine });
        return of<RispostaImmagine>({ id, urlImmagine });
      })
    );
  }

  // get /api/tornei/{id}/iscrizioni (senza filtro esclude le ritirate)
  getIscritti(idTorneo: number, pagina = 1): Observable<PaginaIscrizioni> {
    if (!environment.useMock) {
      const params = new HttpParams().set('pagina', pagina);
      return this.http.get<PaginaIscrizioni>(`${environment.apiUrl}/tornei/${idTorneo}/iscrizioni`, { params });
    }

    return this.iscrittiMock(idTorneo).pipe(
      map(tutti => {
        const p = paginaMock(tutti.filter(i => i.stato !== 'ritirata'), pagina, ISCRITTI_PER_PAGINA);
        return { pagina: p.pagina, pagineTotali: p.pagineTotali, iscrizioni: p.elementi };
      })
    );
  }

  // patch /api/iscrizioni/{id}
  confermaIscrizione(idIscrizione: number, idTorneo: number): Observable<RispostaConferma> {
    if (!environment.useMock) {
      return this.http.patch<RispostaConferma>(`${environment.apiUrl}/iscrizioni/${idIscrizione}`, { stato: 'confermata' });
    }

    return this.iscrittiMock(idTorneo).pipe(
      switchMap(tutti => {
        const iscrizione = tutti.find(i => i.id === idIscrizione);
        if (!iscrizione) return erroreMock(404, { errore: 'Iscrizione non trovata' });
        if (iscrizione.stato !== 'in_attesa') {
          return erroreMock(422, { errore: 'Si possono confermare solo le iscrizioni in attesa' });
        }
        this.salvaIscritti(idTorneo, tutti.map(i => (i.id === idIscrizione ? { ...i, stato: 'confermata' as const } : i)));
        return of<RispostaConferma>({ id: idIscrizione, idTorneo, stato: 'confermata' });
      })
    );
  }

  // delete /api/iscrizioni/{id}: se si libera un posto, il primo in lista d'attesa passa in attesa
  rimuoviIscrizione(idIscrizione: number, idTorneo: number): Observable<RispostaDisiscrizione> {
    if (!environment.useMock) {
      return this.http.delete<RispostaDisiscrizione>(`${environment.apiUrl}/iscrizioni/${idIscrizione}`);
    }

    return forkJoin([this.iscrittiMock(idTorneo), this.torneoMock(idTorneo)]).pipe(
      switchMap(([tutti, t]) => {
        const iscrizione = tutti.find(i => i.id === idIscrizione);
        if (!iscrizione) return erroreMock(404, { errore: 'Iscrizione non trovata' });
        if (iscrizione.stato === 'ritirata') return erroreMock(409, { errore: 'Iscrizione già ritirata' });

        const liberaPosto = iscrizione.stato === 'in_attesa' || iscrizione.stato === 'confermata';
        let lista = tutti.map(i => (i.id === idIscrizione ? { ...i, stato: 'ritirata' as const, posizioneAttesa: null } : i));
        const primo = liberaPosto ? lista.find(i => i.stato === 'lista_attesa') : undefined;
        if (primo) {
          lista = lista.map(i => (i.id === primo.id ? { ...i, stato: 'in_attesa' as const, posizioneAttesa: null } : i));
        }
        lista = this.numeraAttesa(lista);
        this.salvaIscritti(idTorneo, lista);

        const iscritti = lista.filter(i => i.stato === 'in_attesa' || i.stato === 'confermata').length;
        this.salva({ ...t, iscritti });

        return of<RispostaDisiscrizione>({
          id: idIscrizione,
          idTorneo,
          stato: 'ritirata',
          promossa: primo ? { id: primo.id, nome: primo.nome, stato: 'in_attesa' } : null
        });
      })
    );
  }

  // post /api/tornei/{id}/tabellone
  generaTabellone(idTorneo: number): Observable<RispostaTabellone> {
    if (!environment.useMock) {
      return this.http.post<RispostaTabellone>(`${environment.apiUrl}/tornei/${idTorneo}/tabellone`, {});
    }

    return forkJoin([this.torneoMock(idTorneo), this.iscrittiMock(idTorneo)]).pipe(
      switchMap(([t, tutti]) => {
        if (this.mockDb.tabelloni()[idTorneo]) return erroreMock(409, { errore: 'Il tabellone esiste già' });
        if (t.stato !== 'iscrizioni_chiuse') {
          return erroreMock(422, { errore: 'Chiudi le iscrizioni prima di generare il tabellone' });
        }
        const confermate = tutti.filter(i => i.stato === 'confermata');
        if (confermate.length < 2) return erroreMock(422, { errore: 'Servono almeno 2 partecipanti confermati' });

        this.mockDb.tabelloni.update(tutti => ({ ...tutti, [idTorneo]: true }));
        const partite = [];
        for (let i = 0; i < confermate.length; i += 2) {
          partite.push({ id: idTorneo * 100 + i, iscrizioneA: confermate[i].id, iscrizioneB: confermate[i + 1]?.id ?? null });
        }
        return of<RispostaTabellone>({ idTorneo, round: 1, partiteCreate: partite.length, partite });
      })
    );
  }

  // ---- solo mock ----

  private torneoMock(id: number): Observable<TorneoDettaglio> {
    return this.torneiService.getTorneo(id).pipe(take(1));
  }

  private salva(t: TorneoDettaglio) {
    this.mockDb.tornei.update(tutti => ({ ...tutti, [t.id]: t }));
  }

  private salvaIscritti(idTorneo: number, lista: IscrizioneAdmin[]) {
    this.mockDb.iscritti.update(tutti => ({ ...tutti, [idTorneo]: lista }));
  }

  // la prima volta inventa gli iscritti partendo dal numero di posti occupati del torneo
  private iscrittiMock(idTorneo: number): Observable<IscrizioneAdmin[]> {
    const salvati = this.mockDb.iscritti()[idTorneo];
    if (salvati) return of(salvati).pipe(delay(RITARDO_MOCK));

    return this.torneoMock(idTorneo).pipe(
      map(t => {
        const squadre = t.giocatoriPerSquadra > 1;
        const nomi = squadre ? NOMI_SQUADRE : NOMI_UTENTI;
        const pieno = t.iscritti >= t.postiMax;
        const totale = t.iscritti + (pieno && t.stato === 'iscrizioni_aperte' ? 2 : 0);
        const lista: IscrizioneAdmin[] = [];

        for (let i = 0; i < totale; i++) {
          const giorno = new Date(t.aperturaIscrizioni);
          giorno.setDate(giorno.getDate() + Math.min(i, 20));
          const nome = nomi[i % nomi.length] + (i >= nomi.length ? ` ${Math.floor(i / nomi.length) + 1}` : '');
          const inAttesa = i >= t.iscritti;
          lista.push({
            id: idTorneo * 1000 + i + 1,
            nome,
            tipo: squadre ? 'squadra' : 'utente',
            dataIscrizione: giorno.toISOString().slice(0, 19),
            stato: inAttesa ? 'lista_attesa' : i < Math.ceil(t.iscritti * 0.7) ? 'confermata' : 'in_attesa',
            posizioneAttesa: null
          });
        }
        const numerata = this.numeraAttesa(lista);
        this.salvaIscritti(idTorneo, numerata);
        return numerata;
      })
    );
  }

  private numeraAttesa(lista: IscrizioneAdmin[]): IscrizioneAdmin[] {
    let posizione = 0;
    return lista.map(i => (i.stato === 'lista_attesa' ? { ...i, posizioneAttesa: ++posizione } : { ...i, posizioneAttesa: null }));
  }

  // get /api/configurazione/limite-iscrizioni
  getLimiteIscrizioni(): Observable<LimiteIscrizioni> {
    if (!environment.useMock) {
      return this.http.get<LimiteIscrizioni>(`${environment.apiUrl}/configurazione/limite-iscrizioni`);
    }
    return of({ maxTorneiPerUtente: this.mockDb.limiteTornei() }).pipe(delay(RITARDO_MOCK));
  }

  // put /api/configurazione/limite-iscrizioni
  aggiornaLimiteIscrizioni(maxTorneiPerUtente: number): Observable<LimiteAggiornato> {
    if (!environment.useMock) {
      return this.http.put<LimiteAggiornato>(`${environment.apiUrl}/configurazione/limite-iscrizioni`, { maxTorneiPerUtente });
    }
    if (!Number.isInteger(maxTorneiPerUtente) || maxTorneiPerUtente < 1) {
      return erroreMock(422, { errore: 'Il limite deve essere un intero maggiore o uguale a 1' });
    }
    this.mockDb.limiteTornei.set(maxTorneiPerUtente);
    return of({ maxTorneiPerUtente, dataModifica: adessoIso() }).pipe(delay(RITARDO_MOCK));
  }
}
