import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { concat, toArray } from 'rxjs';
import { MembroSquadra, MiaSquadra, RuoloSquadra } from '../../models/squadra';
import { AuthService } from '../../services/auth';
import { SquadreService } from '../../services/squadre';
import { ToastService } from '../../services/toast';

const NOMI_RUOLI: Record<RuoloSquadra, string> = {
  capo_squadra: 'Capo squadra',
  giocatore: 'Giocatore',
  riserva: 'Riserva'
};

const ORDINE_RUOLI: Record<RuoloSquadra, number> = { capo_squadra: 0, giocatore: 1, riserva: 2 };

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
  readonly idMio = computed(() => this.auth.utente()?.id ?? null);

  squadre = signal<MiaSquadra[]>([]);
  caricamento = signal(true);
  erroreCaricamento = signal<string | null>(null);

  nome = '';
  inviato = signal(false);
  creazione = signal(false);
  erroreCrea = signal<string | null>(null);

  aperta = signal<number | null>(null);
  membri = signal<Record<number, MembroSquadra[]>>({});
  caricamentoMembri = signal(false);
  erroreMembri = signal<string | null>(null);

  nickname = '';
  ruolo: RuoloSquadra = 'giocatore';
  invio = signal(false);
  eliminazione = signal(false);
  conferma = signal<string | null>(null);
  private timerConferma?: ReturnType<typeof setTimeout>;

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

  caricaMembri(id: number) {
    this.caricamentoMembri.set(true);
    this.erroreMembri.set(null);
    this.squadreService.getSquadra(id).subscribe({
      next: squadra => {
        this.membri.update(m => ({ ...m, [id]: squadra.membri }));
        this.caricamentoMembri.set(false);
      },
      error: err => {
        this.erroreMembri.set(err.error?.errore ?? 'Impossibile caricare i giocatori');
        this.caricamentoMembri.set(false);
      }
    });
  }

  elenco(id: number) {
    return [...(this.membri()[id] ?? [])].sort((a, b) => ORDINE_RUOLI[a.ruoloSquadra] - ORDINE_RUOLI[b.ruoloSquadra]);
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
        this.membri.update(m => ({ ...m, [squadra.id]: squadra.membri }));
        this.nome = '';
        this.inviato.set(false);
        this.creazione.set(false);
        this.aperta.set(squadra.id);
        this.erroreMembri.set(null);
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
    const apri = this.aperta() !== id;
    this.aperta.set(apri ? id : null);
    this.nickname = '';
    this.ruolo = 'giocatore';
    this.conferma.set(null);
    if (apri) this.caricaMembri(id);
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
        const nuovo: MembroSquadra = { idUtente: membro.idUtente, nickname: membro.nickname, ruoloSquadra: membro.ruoloSquadra };
        this.membri.update(m => ({ ...m, [squadra.id]: [...(m[squadra.id] ?? []), nuovo] }));
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

  private confermato(chiave: string) {
    clearTimeout(this.timerConferma);
    if (this.conferma() === chiave) {
      this.conferma.set(null);
      return true;
    }
    this.conferma.set(chiave);
    this.timerConferma = setTimeout(() => this.conferma.set(null), 3000);
    return false;
  }

  rimuovi(squadra: MiaSquadra, membro: MembroSquadra) {
    if (!this.confermato(`membro-${squadra.id}-${membro.idUtente}`)) return;

    this.squadreService.rimuoviMembro(squadra.id, membro.idUtente).subscribe({
      next: () => {
        this.membri.update(m => ({ ...m, [squadra.id]: (m[squadra.id] ?? []).filter(x => x.idUtente !== membro.idUtente) }));
        this.toast.mostra(`${membro.nickname} rimosso dalla squadra`, 'verde');
        this.carica();
      },
      error: err => this.toast.mostra(err.error?.errore ?? 'Rimozione non riuscita', 'rosso')
    });
  }

  esci(squadra: MiaSquadra) {
    const io = this.idMio();
    if (io === null || !this.confermato(`esci-${squadra.id}`)) return;

    this.squadreService.rimuoviMembro(squadra.id, io).subscribe({
      next: () => {
        this.aperta.set(null);
        this.toast.mostra(`Sei uscito da ${squadra.nome}`, 'verde');
        this.carica();
      },
      error: err => this.toast.mostra(err.error?.errore ?? 'Operazione non riuscita', 'rosso')
    });
  }

  eliminaSquadra(squadra: MiaSquadra) {
    const io = this.idMio();
    if (io === null || !this.confermato(`elimina-${squadra.id}`)) return;

    const altri = (this.membri()[squadra.id] ?? []).filter(m => m.idUtente !== io);
    const chiamate = [
      ...altri.map(m => this.squadreService.rimuoviMembro(squadra.id, m.idUtente)),
      this.squadreService.rimuoviMembro(squadra.id, io)
    ];

    this.eliminazione.set(true);
    concat(...chiamate).pipe(toArray()).subscribe({
      next: () => {
        this.eliminazione.set(false);
        this.aperta.set(null);
        this.toast.mostra(`Squadra ${squadra.nome} eliminata`, 'verde');
        this.carica();
      },
      error: err => {
        this.eliminazione.set(false);
        this.toast.mostra(err.error?.errore ?? 'Eliminazione non riuscita', 'rosso');
        this.caricaMembri(squadra.id);
        this.carica();
      }
    });
  }
}
