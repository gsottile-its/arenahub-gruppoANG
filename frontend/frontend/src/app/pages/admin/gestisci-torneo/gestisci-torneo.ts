import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IscrizioneAdmin, StatoTorneo, TorneoDettaglio } from '../../../models/torneo';
import { AdminService, STATI_MODIFICABILI, TRANSIZIONI } from '../../../services/admin';
import { TorneiService } from '../../../services/tornei';
import { ToastService } from '../../../services/toast';
import { TESTI_STATO_ISCRIZIONE, TESTI_STATO_TORNEO } from '../comune';

@Component({
  selector: 'app-gestisci-torneo',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './gestisci-torneo.html',
  styleUrl: './gestisci-torneo.css'
})
export class GestisciTorneo implements OnInit {
  private admin = inject(AdminService);
  private torneiService = inject(TorneiService);
  private toast = inject(ToastService);

  idTorneo = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  testiStato = TESTI_STATO_TORNEO;
  testiIscrizione = TESTI_STATO_ISCRIZIONE;

  torneo = signal<TorneoDettaglio | null>(null);
  caricamento = signal(true);
  errore = signal<string | null>(null);

  iscrizioni = signal<IscrizioneAdmin[]>([]);
  paginaIscritti = signal(1);
  pagineIscritti = signal(1);
  caricamentoIscritti = signal(true);
  erroreIscritti = signal<string | null>(null);

  nuovoStato: StatoTorneo | null = null;
  inAzione = signal(false);
  confermaAnnulla = signal(false);
  daRimuovere = signal<number | null>(null);
  tabelloneGenerato = signal(false);

  // prossimi stati possibili dalla tendina (l'annullamento ha il suo pulsante)
  statiSuccessivi = computed(() => {
    const t = this.torneo();
    return t ? TRANSIZIONI[t.stato].filter(s => s !== 'annullato') : [];
  });
  modificabile = computed(() => {
    const t = this.torneo();
    return !!t && STATI_MODIFICABILI.includes(t.stato);
  });
  annullabile = computed(() => {
    const t = this.torneo();
    return !!t && TRANSIZIONI[t.stato].includes('annullato');
  });

  ngOnInit() {
    this.caricaTorneo();
    this.caricaIscritti();
  }

  caricaTorneo() {
    this.torneiService.getTorneo(this.idTorneo).subscribe({
      next: t => {
        this.torneo.set(t);
        this.nuovoStato = this.statiSuccessivi()[0] ?? null;
        this.caricamento.set(false);
      },
      error: err => {
        this.errore.set(err.error?.errore ?? 'Impossibile caricare il torneo');
        this.caricamento.set(false);
      }
    });
  }

  // get /api/tornei/{id}/iscrizioni
  caricaIscritti() {
    this.caricamentoIscritti.set(true);
    this.erroreIscritti.set(null);
    this.admin.getIscritti(this.idTorneo, this.paginaIscritti()).subscribe({
      next: pagina => {
        this.iscrizioni.set(pagina.iscrizioni);
        this.pagineIscritti.set(Math.max(1, pagina.pagineTotali));
        this.caricamentoIscritti.set(false);
      },
      error: err => {
        this.erroreIscritti.set(err.error?.errore ?? 'Impossibile caricare gli iscritti');
        this.caricamentoIscritti.set(false);
      }
    });
  }

  cambiaPaginaIscritti(nuova: number) {
    if (nuova < 1 || nuova > this.pagineIscritti()) return;
    this.paginaIscritti.set(nuova);
    this.caricaIscritti();
  }

  // patch /api/tornei/{id}/stato
  applicaStato(stato: StatoTorneo | null) {
    if (!stato) return;
    this.inAzione.set(true);
    this.admin.cambiaStato(this.idTorneo, stato).subscribe({
      next: risposta => {
        this.inAzione.set(false);
        this.confermaAnnulla.set(false);
        this.toast.mostra(`Stato aggiornato: ${this.testiStato[risposta.stato]}`, risposta.stato === 'annullato' ? 'rosso' : 'verde');
        this.caricaTorneo();
      },
      error: err => this.fallito(err, 'Cambio di stato non riuscito')
    });
  }

  // patch /api/iscrizioni/{id}
  conferma(iscrizione: IscrizioneAdmin) {
    this.inAzione.set(true);
    this.admin.confermaIscrizione(iscrizione.id, this.idTorneo).subscribe({
      next: () => {
        this.inAzione.set(false);
        this.toast.mostra(`${iscrizione.nome}: iscrizione confermata`, 'verde');
        this.caricaIscritti();
      },
      error: err => this.fallito(err, 'Conferma non riuscita')
    });
  }

  // delete /api/iscrizioni/{id}
  rimuovi(iscrizione: IscrizioneAdmin) {
    this.inAzione.set(true);
    this.admin.rimuoviIscrizione(iscrizione.id, this.idTorneo).subscribe({
      next: risposta => {
        this.inAzione.set(false);
        this.daRimuovere.set(null);
        const promossa = risposta.promossa ? ` · ${risposta.promossa.nome} passa dalla lista d'attesa` : '';
        this.toast.mostra(`${iscrizione.nome} rimosso dal torneo${promossa}`, 'giallo');
        this.caricaTorneo();
        this.caricaIscritti();
      },
      error: err => this.fallito(err, 'Rimozione non riuscita')
    });
  }

  // post /api/tornei/{id}/tabellone
  generaTabellone() {
    this.inAzione.set(true);
    this.admin.generaTabellone(this.idTorneo).subscribe({
      next: risposta => {
        this.inAzione.set(false);
        this.tabelloneGenerato.set(true);
        this.toast.mostra(`Tabellone generato: ${risposta.partiteCreate} partite nel primo turno. Ora puoi avviare il torneo.`, 'verde');
      },
      error: err => this.fallito(err, 'Generazione del tabellone non riuscita')
    });
  }

  private fallito(err: { error?: { errore?: string } }, testo: string) {
    this.inAzione.set(false);
    this.toast.mostra(err.error?.errore ?? testo, 'rosso');
  }
}
