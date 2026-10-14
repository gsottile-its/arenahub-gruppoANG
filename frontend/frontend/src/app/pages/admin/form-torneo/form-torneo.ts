import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { DatiTorneo, TorneoDettaglio } from '../../../models/torneo';
import { Gioco, Piattaforma, Tipologia } from '../../../models/catalogo';
import { AdminService, STATI_MODIFICABILI } from '../../../services/admin';
import { CataloghiService } from '../../../services/cataloghi';
import { TorneiService } from '../../../services/tornei';
import { ToastService } from '../../../services/toast';
import { TESTI_STATO_TORNEO, daCampoData, perCampoData } from '../comune';

type Errori = Partial<Record<'nome' | 'gioco' | 'piattaforme' | 'apertura' | 'chiusura' | 'giocatori' | 'posti', string>>;

// stesso form per creazione (post /api/tornei) e modifica (put /api/tornei/{id})
@Component({
  selector: 'app-form-torneo',
  imports: [FormsModule, RouterLink],
  templateUrl: './form-torneo.html',
  styleUrl: './form-torneo.css'
})
export class FormTorneo implements OnInit {
  private router = inject(Router);
  private admin = inject(AdminService);
  private cataloghi = inject(CataloghiService);
  private torneiService = inject(TorneiService);
  private toast = inject(ToastService);

  idTorneo = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  modifica = this.idTorneo !== null;
  testiStato = TESTI_STATO_TORNEO;

  tipologie = signal<Tipologia[]>([]);
  giochi = signal<Gioco[]>([]);
  piattaforme = signal<Piattaforma[]>([]);
  originale = signal<TorneoDettaglio | null>(null);

  caricamento = signal(true);
  salvataggio = signal(false);
  inviato = signal(false);
  erroreServer = signal<string | null>(null);
  erroreCaricamento = signal<string | null>(null);

  nome = '';
  idTipologia: number | null = null;
  idGioco: number | null = null;
  idPiattaforme: number[] = [];
  premio = '';
  apertura = '';
  chiusura = '';
  giocatoriPerSquadra: number | null = 1;
  postiMax: number | null = 16;
  descrizione = '';

  file: File | null = null;
  anteprima = signal<string | null>(null);
  erroreFile = signal<string | null>(null);

  ngOnInit() {
    const torneo$: Observable<TorneoDettaglio | null> = this.idTorneo ? this.torneiService.getTorneo(this.idTorneo) : of(null);

    forkJoin([this.cataloghi.getTipologie(), this.cataloghi.getGiochi(), this.cataloghi.getPiattaforme(), torneo$]).subscribe({
      next: ([tipologie, giochi, piattaforme, torneo]) => {
        this.tipologie.set(tipologie);
        this.giochi.set(giochi);
        this.piattaforme.set(piattaforme);
        if (torneo) this.compila(torneo);
        this.caricamento.set(false);
      },
      error: err => {
        this.erroreCaricamento.set(err.error?.errore ?? 'Impossibile caricare i dati');
        this.caricamento.set(false);
      }
    });
  }

  // in modifica: con iscrizioni presenti gioco e formato non si possono cambiare
  formatoBloccato(): boolean {
    return (this.originale()?.iscritti ?? 0) > 0;
  }

  nonModificabile(): boolean {
    const t = this.originale();
    return !!t && !STATI_MODIFICABILI.includes(t.stato);
  }

  giochiDellaCategoria(): Gioco[] {
    return this.idTipologia === null ? this.giochi() : this.giochi().filter(g => g.tipologia.id === this.idTipologia);
  }

  scegliTipologia(id: number | null) {
    this.idTipologia = id;
    if (this.idGioco !== null && !this.giochiDellaCategoria().some(g => g.id === this.idGioco)) this.idGioco = null;
  }

  scegliGioco(id: number | null) {
    this.idGioco = id;
    const gioco = this.giochi().find(g => g.id === id);
    if (gioco) this.idTipologia = gioco.tipologia.id;
  }

  cambiaPiattaforma(id: number) {
    this.idPiattaforme = this.idPiattaforme.includes(id)
      ? this.idPiattaforme.filter(p => p !== id)
      : [...this.idPiattaforme, id];
  }

  scegliFile(evento: Event) {
    const file = (evento.target as HTMLInputElement).files?.[0] ?? null;
    this.erroreFile.set(null);
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.erroreFile.set('Formato non supportato: usa jpg o png');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.erroreFile.set('Immagine troppo grande (max 2 MB)');
      return;
    }
    this.file = file;
    this.anteprima.set(URL.createObjectURL(file));
  }

  errori(): Errori {
    const e: Errori = {};
    if (!this.nome.trim()) e.nome = 'Il nome è obbligatorio';
    if (this.idGioco === null) e.gioco = 'Scegli il gioco';
    if (this.idPiattaforme.length === 0) e.piattaforme = 'Scegli almeno una piattaforma';
    if (!this.apertura) e.apertura = 'Data obbligatoria';
    if (!this.chiusura) e.chiusura = 'Data obbligatoria';
    else if (this.apertura && this.apertura >= this.chiusura) e.chiusura = "Deve essere dopo l'apertura";
    if (!Number.isInteger(this.giocatoriPerSquadra) || (this.giocatoriPerSquadra ?? 0) < 1) e.giocatori = 'Almeno 1';
    const minimo = Math.max(2, this.originale()?.iscritti ?? 0);
    if (!Number.isInteger(this.postiMax) || (this.postiMax ?? 0) < minimo) e.posti = `Almeno ${minimo}`;
    return e;
  }

  sbagliato(campo: keyof Errori): boolean {
    return this.inviato() && !!this.errori()[campo];
  }

  salva() {
    this.inviato.set(true);
    this.erroreServer.set(null);
    if (Object.keys(this.errori()).length > 0) return;

    const dati: DatiTorneo = {
      nome: this.nome.trim(),
      idGioco: this.idGioco!,
      idPiattaforme: [...this.idPiattaforme].sort((a, b) => a - b),
      premio: this.premio.trim() || null,
      aperturaIscrizioni: daCampoData(this.apertura),
      chiusuraIscrizioni: daCampoData(this.chiusura),
      giocatoriPerSquadra: Number(this.giocatoriPerSquadra),
      postiMax: Number(this.postiMax),
      descrizione: this.descrizione.trim() || null
    };

    if (this.modifica) this.salvaModifiche(dati);
    else this.crea(dati);
  }

  private crea(dati: DatiTorneo) {
    this.salvataggio.set(true);
    this.admin.creaTorneo(dati).pipe(
      switchMap(creato => this.caricaImmagine(creato.id).pipe(map(() => creato)))
    ).subscribe({
      next: creato => {
        this.toast.mostra(`Torneo "${creato.nome}" creato in bozza`, 'verde');
        this.router.navigate(['/admin/tornei']);
      },
      error: err => this.errore(err)
    });
  }

  private salvaModifiche(dati: DatiTorneo) {
    const o = this.originale()!;
    const campi: Partial<DatiTorneo> = {};
    if (dati.nome !== o.nome) campi.nome = dati.nome;
    if (dati.idGioco !== o.gioco.id) campi.idGioco = dati.idGioco;
    const piattaformePrima = o.piattaforme.map(p => p.id).sort((a, b) => a - b);
    if (dati.idPiattaforme.join() !== piattaformePrima.join()) campi.idPiattaforme = dati.idPiattaforme;
    if (dati.premio !== (o.premio ?? null)) campi.premio = dati.premio;
    if (dati.aperturaIscrizioni !== daCampoData(perCampoData(o.aperturaIscrizioni))) campi.aperturaIscrizioni = dati.aperturaIscrizioni;
    if (dati.chiusuraIscrizioni !== daCampoData(perCampoData(o.chiusuraIscrizioni))) campi.chiusuraIscrizioni = dati.chiusuraIscrizioni;
    if (dati.giocatoriPerSquadra !== o.giocatoriPerSquadra) campi.giocatoriPerSquadra = dati.giocatoriPerSquadra;
    if (dati.postiMax !== o.postiMax) campi.postiMax = dati.postiMax;
    if (dati.descrizione !== (o.descrizione ?? null)) campi.descrizione = dati.descrizione;

    if (Object.keys(campi).length === 0 && !this.file) {
      this.toast.mostra('Nessuna modifica da salvare', 'giallo');
      return;
    }

    this.salvataggio.set(true);
    const salvataggio$: Observable<unknown> = Object.keys(campi).length > 0 ? this.admin.modificaTorneo(o.id, campi) : of(null);
    salvataggio$.pipe(switchMap(() => this.caricaImmagine(o.id))).subscribe({
      next: () => {
        this.toast.mostra('Torneo aggiornato', 'verde');
        this.router.navigate(['/admin/tornei', o.id]);
      },
      error: err => this.errore(err)
    });
  }

  // post /api/tornei/{id}/immagine: se fallisce il torneo resta salvato, avvisiamo e basta
  private caricaImmagine(id: number): Observable<unknown> {
    if (!this.file) return of(null);
    return this.admin.caricaImmagine(id, this.file).pipe(
      catchError(err => {
        this.toast.mostra(`Torneo salvato, ma l'immagine non è stata caricata: ${err.error?.errore ?? 'errore'}`, 'giallo');
        return of(null);
      })
    );
  }

  private errore(err: { error?: { errore?: string } }) {
    this.salvataggio.set(false);
    this.erroreServer.set(err.error?.errore ?? 'Salvataggio non riuscito, riprova');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private compila(t: TorneoDettaglio) {
    this.originale.set(t);
    this.nome = t.nome;
    this.idGioco = t.gioco.id;
    this.idTipologia = this.giochi().find(g => g.id === t.gioco.id)?.tipologia.id ?? null;
    this.idPiattaforme = t.piattaforme.map(p => p.id);
    this.premio = t.premio ?? '';
    this.apertura = perCampoData(t.aperturaIscrizioni);
    this.chiusura = perCampoData(t.chiusuraIscrizioni);
    this.giocatoriPerSquadra = t.giocatoriPerSquadra;
    this.postiMax = t.postiMax;
    this.descrizione = t.descrizione ?? '';
    this.anteprima.set(t.urlImmagine);
  }
}
