import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StatoTorneo, TorneoCard } from '../../../models/torneo';
import { Gioco, Piattaforma, Tipologia } from '../../../models/catalogo';
import { CataloghiService } from '../../../services/cataloghi';
import { TorneiService } from '../../../services/tornei';
import { TESTI_STATO_TORNEO, elencoAdmin } from '../comune';

@Component({
  selector: 'app-gestione-tornei',
  imports: [FormsModule, RouterLink],
  templateUrl: './gestione-tornei.html',
  styleUrl: './gestione-tornei.css'
})
export class GestioneTornei implements OnInit {
  private torneiService = inject(TorneiService);
  private cataloghi = inject(CataloghiService);

  // l'admin vede anche le bozze (get /api/tornei?stato=bozza)
  filtriStato: { testo: string; stato: StatoTorneo | null }[] = [
    { testo: 'Tutti', stato: null },
    { testo: 'Bozze', stato: 'bozza' },
    { testo: 'Aperti', stato: 'iscrizioni_aperte' },
    { testo: 'Chiusi', stato: 'iscrizioni_chiuse' },
    { testo: 'In corso', stato: 'in_corso' },
    { testo: 'Conclusi', stato: 'concluso' },
    { testo: 'Cancellati', stato: 'annullato' }
  ];
  testiStato = TESTI_STATO_TORNEO;
  formati = [1, 2, 3, 4, 5];

  tornei = signal<TorneoCard[]>([]);
  filtroStato = signal<StatoTorneo | null>(elencoAdmin.stato);
  pagina = signal(elencoAdmin.pagina);
  pagineTotali = signal(1);
  caricamento = signal(true);
  errore = signal<string | null>(null);

  tipologie = signal<Tipologia[]>([]);
  giochi = signal<Gioco[]>([]);
  piattaforme = signal<Piattaforma[]>([]);

  ricerca = signal(elencoAdmin.ricerca);
  pannelloFiltri = signal(false);
  idTipologia = signal<number | null>(elencoAdmin.idTipologia);
  nomeGioco = signal<string | null>(elencoAdmin.nomeGioco);
  nomePiattaforma = signal<string | null>(elencoAdmin.nomePiattaforma);
  formato = signal<number | null>(elencoAdmin.formato);

  numeriPagina = computed(() => Array.from({ length: this.pagineTotali() }, (_, i) => i + 1));
  giochiDellaCategoria = computed(() =>
    this.idTipologia() === null ? this.giochi() : this.giochi().filter(g => g.tipologia.id === this.idTipologia())
  );
  filtriAttivi = computed(() =>
    [this.idTipologia(), this.nomeGioco(), this.nomePiattaforma(), this.formato()].filter(v => v !== null).length
  );

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
    this.pannelloFiltri.set(this.filtriAttivi() > 0);
    this.carica();
    this.cataloghi.getTipologie().subscribe({ next: v => this.tipologie.set(v), error: () => {} });
    this.cataloghi.getGiochi().subscribe({ next: v => this.giochi.set(v), error: () => {} });
    this.cataloghi.getPiattaforme().subscribe({ next: v => this.piattaforme.set(v), error: () => {} });
  }

  scegliStato(stato: StatoTorneo | null) {
    this.filtroStato.set(stato);
    this.pagina.set(1);
    this.ricorda();
    this.carica();
  }

  scegliTipologia(id: number | null) {
    this.idTipologia.set(id);
    if (this.nomeGioco() && !this.giochiDellaCategoria().some(g => g.nome === this.nomeGioco())) {
      this.nomeGioco.set(null);
    }
    this.ricorda();
  }

  azzeraFiltri() {
    this.ricerca.set('');
    this.idTipologia.set(null);
    this.nomeGioco.set(null);
    this.nomePiattaforma.set(null);
    this.formato.set(null);
    this.ricorda();
  }

  vaiAPagina(nuova: number) {
    if (nuova < 1 || nuova > this.pagineTotali() || nuova === this.pagina()) return;
    this.pagina.set(nuova);
    this.ricorda();
    this.carica();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ricorda() {
    elencoAdmin.pagina = this.pagina();
    elencoAdmin.stato = this.filtroStato();
    elencoAdmin.ricerca = this.ricerca();
    elencoAdmin.idTipologia = this.idTipologia();
    elencoAdmin.nomeGioco = this.nomeGioco();
    elencoAdmin.nomePiattaforma = this.nomePiattaforma();
    elencoAdmin.formato = this.formato();
  }

  carica() {
    this.caricamento.set(true);
    this.errore.set(null);
    this.torneiService.getTornei(this.filtroStato(), this.pagina()).subscribe({
      next: risposta => {
        if (risposta.tornei.length === 0 && this.pagina() > 1) {
          this.pagina.set(1);
          this.ricorda();
          this.carica();
          return;
        }
        this.tornei.set(risposta.tornei);
        this.pagineTotali.set(Math.max(1, risposta.pagineTotali));
        this.caricamento.set(false);
      },
      error: err => {
        this.errore.set(err.error?.errore ?? 'Impossibile caricare i tornei');
        this.caricamento.set(false);
      }
    });
  }
}
