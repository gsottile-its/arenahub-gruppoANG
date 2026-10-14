import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatoTorneo, TorneoCard } from '../../../models/torneo';
import { TorneiService } from '../../../services/tornei';
import { TESTI_STATO_TORNEO } from '../comune';

@Component({
  selector: 'app-gestione-tornei',
  imports: [RouterLink],
  templateUrl: './gestione-tornei.html',
  styleUrl: './gestione-tornei.css'
})
export class GestioneTornei implements OnInit {
  private torneiService = inject(TorneiService);

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

  tornei = signal<TorneoCard[]>([]);
  filtroStato = signal<StatoTorneo | null>(null);
  pagina = signal(1);
  pagineTotali = signal(1);
  caricamento = signal(true);
  errore = signal<string | null>(null);

  numeriPagina = computed(() => Array.from({ length: this.pagineTotali() }, (_, i) => i + 1));

  ngOnInit() {
    this.carica();
  }

  scegliStato(stato: StatoTorneo | null) {
    this.filtroStato.set(stato);
    this.pagina.set(1);
    this.carica();
  }

  vaiAPagina(nuova: number) {
    if (nuova < 1 || nuova > this.pagineTotali() || nuova === this.pagina()) return;
    this.pagina.set(nuova);
    this.carica();
  }

  carica() {
    this.caricamento.set(true);
    this.errore.set(null);
    this.torneiService.getTornei(this.filtroStato(), this.pagina()).subscribe({
      next: risposta => {
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
