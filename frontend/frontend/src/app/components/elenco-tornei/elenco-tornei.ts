import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { PaginaTornei, StatoTorneo, TorneoCard } from '../../models/torneo';
import { Gioco, Piattaforma, Tipologia } from '../../models/catalogo';
import { CataloghiService } from '../../services/cataloghi';
import { CardTorneo } from '../card-torneo/card-torneo';
import { DettaglioTorneo } from '../dettaglio-torneo/dettaglio-torneo';

export type CaricaTornei = (stato: StatoTorneo | null, pagina: number) => Observable<PaginaTornei>;

@Component({
  selector: 'app-elenco-tornei',
  imports: [CardTorneo, DettaglioTorneo, FormsModule],
  templateUrl: './elenco-tornei.html',
  styleUrl: './elenco-tornei.css'
})
export class ElencoTornei implements OnInit {
  private router = inject(Router);
  private cataloghi = inject(CataloghiService);

  titolo = input.required<string>();
  carica = input.required<CaricaTornei>();
  messaggioVuoto = input('Nessun torneo');

  filtriStato: { testo: string; stato: StatoTorneo | null }[] = [
    { testo: 'Tutti', stato: null },
    { testo: 'Iscrizioni aperte', stato: 'iscrizioni_aperte' },
    { testo: 'In corso', stato: 'in_corso' },
    { testo: 'Conclusi', stato: 'concluso' },
    { testo: 'Cancellati', stato: 'annullato' }
  ];
  formati = [1, 2, 3, 4, 5];

  tornei = signal<TorneoCard[]>([]);
  filtroStato = signal<StatoTorneo | null>(null);
  vista = signal<'griglia' | 'lista'>('griglia');
  pagina = signal(1);
  pagineTotali = signal(1);
  caricamento = signal(true);
  errore = signal<string | null>(null);

  tipologie = signal<Tipologia[]>([]);
  giochi = signal<Gioco[]>([]);
  piattaforme = signal<Piattaforma[]>([]);

  ricerca = signal('');
  pannelloFiltri = signal(false);
  idTipologia = signal<number | null>(null);
  nomeGioco = signal<string | null>(null);
  nomePiattaforma = signal<string | null>(null);
  formato = signal<number | null>(null);

  // il popup si apre con ?torneo=id nell'indirizzo: la pagina sotto resta la stessa
  idAperto = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map(p => (p.get('torneo') ? Number(p.get('torneo')) : null))),
    { initialValue: null }
  );

  numeriPagina = computed(() => Array.from({ length: this.pagineTotali() }, (_, i) => i + 1));
  giochiDellaCategoria = computed(() =>
    this.idTipologia() === null ? this.giochi() : this.giochi().filter(g => g.tipologia.id === this.idTipologia())
  );
  filtriAttivi = computed(() =>
    [this.idTipologia(), this.nomeGioco(), this.nomePiattaforma(), this.formato()].filter(v => v !== null).length
  );

  // ricerca e filtri extra non sono nel contratto: si applicano ai tornei già scaricati
  torneiFiltrati = computed(() => {
    const testo = this.ricerca().trim().toLowerCase();
    const giochiOk = new Set(this.giochiDellaCategoria().map(g => g.nome));
    return this.tornei().filter(t =>
      (!testo || t.nome.toLowerCase().includes(testo) || t.gioco.toLowerCase().includes(testo))
      && (this.idTipologia() === null || giochiOk.has(t.gioco))
      && (this.nomeGioco() === null || t.gioco === this.nomeGioco())
      && (this.nomePiattaforma() === null || t.piattaforme.includes(this.nomePiattaforma()!))
      && (this.formato() === null || (this.formato() === 5 ? t.giocatoriPerSquadra >= 5 : t.giocatoriPerSquadra === this.formato()))
    );
  });

  ngOnInit() {
    this.ricarica();
    this.cataloghi.getTipologie().subscribe({ next: v => this.tipologie.set(v), error: () => {} });
    this.cataloghi.getGiochi().subscribe({ next: v => this.giochi.set(v), error: () => {} });
    this.cataloghi.getPiattaforme().subscribe({ next: v => this.piattaforme.set(v), error: () => {} });
  }

  scegliStato(stato: StatoTorneo | null) {
    this.filtroStato.set(stato);
    this.pagina.set(1);
    this.ricarica();
  }

  scegliTipologia(id: number | null) {
    this.idTipologia.set(id);
    if (this.nomeGioco() && !this.giochiDellaCategoria().some(g => g.nome === this.nomeGioco())) {
      this.nomeGioco.set(null);
    }
  }

  azzeraFiltri() {
    this.ricerca.set('');
    this.idTipologia.set(null);
    this.nomeGioco.set(null);
    this.nomePiattaforma.set(null);
    this.formato.set(null);
  }

  vaiAPagina(nuova: number) {
    if (nuova < 1 || nuova > this.pagineTotali()) return;
    this.pagina.set(nuova);
    this.ricarica();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  apriDettaglio(id: number) {
    this.router.navigate([], { queryParams: { torneo: id }, queryParamsHandling: 'merge' });
  }

  chiudiDettaglio() {
    this.router.navigate([], { queryParams: { torneo: null }, queryParamsHandling: 'merge' });
  }


  ricarica() {
    this.caricamento.set(true);
    this.errore.set(null);

    this.carica()(this.filtroStato(), this.pagina()).subscribe({
      next: risposta => {
        if (risposta.tornei.length === 0 && this.pagina() > 1) {
          this.vaiAPagina(this.pagina() - 1);
          return;
        }
        this.tornei.set(risposta.tornei);
        this.pagineTotali.set(risposta.pagineTotali);
        this.caricamento.set(false);
      },
      error: err => {
        this.errore.set(err.error?.errore ?? 'Impossibile caricare i tornei. Riprova più tardi.');
        this.caricamento.set(false);
      }
    });
  }
}
