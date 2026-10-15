import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Partita, Turno } from '../../models/torneo';
import { AdminService } from '../../services/admin';
import { TorneiService } from '../../services/tornei';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-tabellone',
  imports: [FormsModule],
  templateUrl: './tabellone.html',
  styleUrl: './tabellone.css'
})
export class TabelloneTorneo {
  private torneiService = inject(TorneiService);
  private admin = inject(AdminService);
  private toast = inject(ToastService);

  idTorneo = input.required<number>();
  modificabile = input(false);
  versione = input(0);

  caricato = output<boolean>();
  aggiornato = output<void>();

  turni = signal<Turno[]>([]);
  caricamento = signal(true);
  errore = signal<string | null>(null);

  inModifica = signal<number | null>(null);
  punteggioA: number | null = null;
  punteggioB: number | null = null;
  salvataggio = signal(false);

  numeroTurni = computed(() => this.turni().length);

  constructor() {
    effect(() => {
      this.versione();
      this.carica(this.idTorneo());
    });
  }

  carica(idTorneo: number) {
    this.caricamento.set(true);
    this.errore.set(null);
    this.torneiService.getPartite(idTorneo).subscribe({
      next: tabellone => {
        this.turni.set(tabellone.turni);
        this.caricamento.set(false);
        this.caricato.emit(tabellone.turni.length > 0);
      },
      error: err => {
        this.errore.set(err.error?.errore ?? 'Impossibile caricare il tabellone');
        this.caricamento.set(false);
      }
    });
  }

  nomeTurno(round: number): string {
    const mancanti = this.numeroTurni() - round;
    if (mancanti === 0) return 'Finale';
    if (mancanti === 1) return 'Semifinali';
    if (mancanti === 2) return 'Quarti';
    return `Turno ${round}`;
  }

  passaggioDiretto(p: Partita): boolean {
    return p.stato === 'conclusa' && p.partecipanteA !== null && p.partecipanteB === null;
  }

  puoInserire(p: Partita): boolean {
    return this.modificabile() && p.partecipanteA !== null && p.partecipanteB !== null;
  }

  apri(p: Partita) {
    this.inModifica.set(p.id);
    this.punteggioA = p.punteggioA;
    this.punteggioB = p.punteggioB;
  }

  chiudi() {
    this.inModifica.set(null);
  }

  salva(p: Partita) {
    const a = this.punteggioA;
    const b = this.punteggioB;
    if (a === null || b === null || a < 0 || b < 0 || !Number.isInteger(a) || !Number.isInteger(b)) {
      this.toast.mostra('Inserisci due punteggi interi, zero o più', 'giallo');
      return;
    }
    if (a === b) {
      this.toast.mostra('Il pareggio non è ammesso', 'giallo');
      return;
    }

    this.salvataggio.set(true);
    this.admin.registraRisultato(p.id, this.idTorneo(), a, b).subscribe({
      next: risposta => {
        this.salvataggio.set(false);
        this.inModifica.set(null);
        const finale = risposta.prossimaPartita === null;
        this.toast.mostra(
          finale ? `${risposta.vincitore.nome} vince il torneo!` : `${risposta.vincitore.nome} passa al turno successivo`,
          'verde'
        );
        this.carica(this.idTorneo());
        this.aggiornato.emit();
      },
      error: err => {
        this.salvataggio.set(false);
        this.toast.mostra(err.error?.errore ?? 'Risultato non salvato', 'rosso');
      }
    });
  }
}
