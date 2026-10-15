import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MembroSquadra, MiaSquadra, RuoloSquadra } from '../../models/squadra';
import { AuthService } from '../../services/auth';
import { SquadreService } from '../../services/squadre';
import { ToastService } from '../../services/toast';

const NOMI_RUOLI: Record<RuoloSquadra, string> = {
  capo_squadra: 'Capo squadra',
  giocatore: 'Giocatore',
  riserva: 'Riserva'
};

@Component({
  selector: 'app-squadre',
  imports: [FormsModule],
  templateUrl: './squadre.html',
  styleUrl: './squadre.css'
})
export class Squadre {
  private squadreService = inject(SquadreService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  readonly ruoli = NOMI_RUOLI;

  squadre = signal<MiaSquadra[]>([]);
  caricamento = signal(true);
  erroreCaricamento = signal<string | null>(null);

  nome = '';
  inviato = signal(false);
  creazione = signal(false);
  erroreCrea = signal<string | null>(null);

  aperta = signal<number | null>(null);
  nickname = '';
  ruolo: RuoloSquadra = 'giocatore';
  invio = signal(false);
  conferma = signal<number | null>(null);

  // l'api non ha un elenco dei membri, teniamo quelli che arrivano dalle risposte
  membriNoti = signal<Record<number, MembroSquadra[]>>({});

  constructor() {
    this.carica();
  }

  carica() {
    this.squadreService.getMie().subscribe({
      next: lista => {
        this.squadre.set(lista);
        this.caricamento.set(false);
      },
      error: err => {
        this.erroreCaricamento.set(err.error?.errore ?? 'Impossibile caricare le tue squadre');
        this.caricamento.set(false);
      }
    });
  }

  erroreNome() {
    const nome = this.nome.trim();
    if (nome === '') return 'Il nome è obbligatorio';
    if (nome.length > 50) return 'Massimo 50 caratteri';
    return null;
  }

  crea() {
    this.inviato.set(true);
    this.erroreCrea.set(null);
    if (this.erroreNome()) return;

    this.creazione.set(true);
    this.squadreService.crea(this.nome.trim()).subscribe({
      next: squadra => {
        this.membriNoti.update(m => ({ ...m, [squadra.id]: squadra.membri }));
        this.nome = '';
        this.inviato.set(false);
        this.creazione.set(false);
        this.aperta.set(squadra.id);
        this.toast.mostra(`Squadra ${squadra.nome} creata!`, 'verde');
        this.carica();
      },
      error: err => {
        this.creazione.set(false);
        this.erroreCrea.set(err.error?.errore ?? 'Creazione non riuscita. Riprova più tardi.');
      }
    });
  }

  apriChiudi(id: number) {
    this.aperta.update(a => (a === id ? null : id));
    this.nickname = '';
    this.ruolo = 'giocatore';
    this.conferma.set(null);
  }

  aggiungi(squadra: MiaSquadra) {
    const nickname = this.nickname.trim();
    if (nickname === '') {
      this.toast.mostra('Scrivi il nickname del giocatore', 'giallo');
      return;
    }

    this.invio.set(true);
    this.squadreService.aggiungiMembro(squadra.id, nickname, this.ruolo).subscribe({
      next: membro => {
        this.membriNoti.update(m => ({ ...m, [squadra.id]: [...(m[squadra.id] ?? []), membro] }));
        this.nickname = '';
        this.invio.set(false);
        this.toast.mostra(`${membro.nickname} aggiunto alla squadra`, 'verde');
        this.carica();
      },
      error: err => {
        this.invio.set(false);
        this.toast.mostra(err.error?.errore ?? 'Aggiunta non riuscita', 'rosso');
      }
    });
  }

  rimuovi(squadra: MiaSquadra, membro: MembroSquadra) {
    this.squadreService.rimuoviMembro(squadra.id, membro.idUtente).subscribe({
      next: () => {
        this.membriNoti.update(m => ({ ...m, [squadra.id]: (m[squadra.id] ?? []).filter(x => x.idUtente !== membro.idUtente) }));
        this.toast.mostra(`${membro.nickname} rimosso dalla squadra`, 'verde');
        this.carica();
      },
      error: err => this.toast.mostra(err.error?.errore ?? 'Rimozione non riuscita', 'rosso')
    });
  }

  // esce dalla squadra; se è il capo rimasto da solo la squadra viene eliminata
  esci(squadra: MiaSquadra) {
    const io = this.auth.utente();
    if (!io) return;

    if (this.conferma() !== squadra.id) {
      this.conferma.set(squadra.id);
      return;
    }

    const elimina = squadra.mioRuolo === 'capo_squadra';
    this.squadreService.rimuoviMembro(squadra.id, io.id).subscribe({
      next: () => {
        this.conferma.set(null);
        this.aperta.set(null);
        this.toast.mostra(elimina ? `Squadra ${squadra.nome} eliminata` : `Sei uscito da ${squadra.nome}`, 'verde');
        this.carica();
      },
      error: err => {
        this.conferma.set(null);
        this.toast.mostra(err.error?.errore ?? 'Operazione non riuscita', 'rosso');
      }
    });
  }
}
