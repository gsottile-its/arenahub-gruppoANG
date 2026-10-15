import { Component, DestroyRef, ElementRef, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TorneoCard, TorneoDettaglio } from '../../models/torneo';
import { MiaSquadra } from '../../models/squadra';
import { AuthService } from '../../services/auth';
import { TorneiService } from '../../services/tornei';
import { IscrizioniService } from '../../services/iscrizioni';
import { SquadreService } from '../../services/squadre';
import { ToastService } from '../../services/toast';
import { TabelloneTorneo } from '../tabellone/tabellone';

@Component({
  selector: 'app-dettaglio-torneo',
  imports: [DatePipe, FormsModule, TabelloneTorneo],
  templateUrl: './dettaglio-torneo.html',
  styleUrl: './dettaglio-torneo.css',
  host: { '(document:keydown.escape)': 'chiudi.emit()' }
})
export class DettaglioTorneo {
  protected auth = inject(AuthService);
  private router = inject(Router);
  private elemento = inject(ElementRef<HTMLElement>);
  private torneiService = inject(TorneiService);
  private iscrizioniService = inject(IscrizioniService);
  private squadreService = inject(SquadreService);
  private toast = inject(ToastService);

  idTorneo = input.required<number>();
  chiudi = output<void>();
  apri = output<number>();
  cambiato = output<void>();

  torneo = signal<TorneoDettaglio | null>(null);
  caricamento = signal(true);
  errore = signal<string | null>(null);
  squadre = signal<MiaSquadra[]>([]);
  aperti = signal<TorneoCard[]>([]);
  idSquadraScelta: number | null = null;
  inAzione = signal(false);
  chiediConferma = signal(false);
  festa = signal(0);

  pieno = computed(() => {
    const t = this.torneo();
    return !!t && t.iscritti >= t.postiMax;
  });
  percentualePosti = computed(() => {
    const t = this.torneo();
    return t ? Math.min(100, Math.round((t.iscritti / t.postiMax) * 100)) : 0;
  });
  piattaforme = computed(() => (this.torneo()?.piattaforme ?? []).map(p => p.nome));
  aSquadre = computed(() => (this.torneo()?.giocatoriPerSquadra ?? 1) > 1);
  squadreCapo = computed(() => this.squadre().filter(s => s.mioRuolo === 'capo_squadra'));
  miaIscrizione = computed(() => {
    const mia = this.torneo()?.miaIscrizione;
    return mia && mia.stato !== 'ritirata' ? mia : null;
  });
  // ci si può ritirare solo prima dell'inizio (contratto: 409 "il torneo è già iniziato")
  puoDisiscriversi = computed(() => {
    const stato = this.torneo()?.stato;
    return stato === 'iscrizioni_aperte' || stato === 'iscrizioni_chiuse';
  });
  testoStatoIscrizione = computed(() => {
    const mia = this.miaIscrizione();
    if (!mia) return '';
    if (mia.stato === 'confermata') return 'Iscrizione confermata';
    if (mia.stato === 'in_attesa') return "In attesa di conferma dell'organizzatore";
    return `In lista d'attesa (posizione ${mia.posizioneAttesa ?? '?'})`;
  });
  etichettaStato = computed(() => {
    const testi: Record<string, string> = {
      bozza: 'Bozza',
      iscrizioni_aperte: 'Iscrizioni aperte',
      iscrizioni_chiuse: 'Iscrizioni chiuse',
      in_corso: 'In corso',
      concluso: 'Concluso',
      annullato: 'Cancellato'
    };
    return testi[this.torneo()?.stato ?? ''] ?? '';
  });

  // consigliati: tornei aperti con lo stesso gioco, piattaforme in comune o stesso formato
  consigliati = computed(() => {
    const t = this.torneo();
    if (!t) return [];
    const mie = this.piattaforme();
    return this.aperti()
      .filter(a => a.id !== t.id)
      .map(a => ({
        torneo: a,
        punti: (a.gioco === t.gioco.nome ? 3 : 0)
          + a.piattaforme.filter(p => mie.includes(p)).length
          + (a.giocatoriPerSquadra === t.giocatoriPerSquadra ? 1 : 0)
      }))
      .filter(c => c.punti > 0)
      .sort((x, y) => y.punti - x.punti || x.torneo.nome.localeCompare(y.torneo.nome))
      .slice(0, 4)
      .map(c => c.torneo);
  });

  constructor() {
    document.body.style.overflow = 'hidden';
    inject(DestroyRef).onDestroy(() => (document.body.style.overflow = ''));

    effect(() => {
      const id = this.idTorneo();
      untracked(() => this.carica(id, true));
    });

    this.torneiService.getTornei('iscrizioni_aperte', 1).subscribe({
      next: pagina => this.aperti.set(pagina.tornei),
      error: () => this.aperti.set([])
    });
  }

  private carica(id: number, nuovo = false) {
    if (nuovo) {
      this.torneo.set(null);
      this.chiediConferma.set(false);
      this.elemento.nativeElement.querySelector('.popup')?.scrollTo({ top: 0 });
    }
    this.caricamento.set(true);
    this.errore.set(null);

    this.torneiService.getTorneo(id).subscribe({
      next: t => {
        this.torneo.set(t);
        this.caricamento.set(false);
        if (this.auth.loggato() && t.giocatoriPerSquadra > 1 && this.squadre().length === 0) {
          this.caricaSquadre();
        }
      },
      error: err => {
        this.errore.set(err.error?.errore ?? 'Impossibile caricare il torneo');
        this.caricamento.set(false);
      }
    });
  }

  private ricarica() {
    this.carica(this.idTorneo());
    this.cambiato.emit();
  }

  private caricaSquadre() {
    this.squadreService.getMie().subscribe({
      next: squadre => {
        this.squadre.set(squadre);
        const capo = squadre.filter(s => s.mioRuolo === 'capo_squadra');
        if (capo.length > 0) this.idSquadraScelta = capo[0].id;
      },
      error: () => this.toast.mostra('Impossibile caricare le tue squadre', 'rosso')
    });
  }

  accediPerIscriverti() {
    this.router.navigate(['/login'], { queryParams: { ritorno: this.router.url } });
  }

  // post /api/tornei/{id}/iscrizioni
  iscriviti() {
    if (this.aSquadre() && this.idSquadraScelta === null) {
      this.toast.mostra('Scegli la squadra da iscrivere', 'giallo');
      return;
    }
    this.inAzione.set(true);
    const idSquadra = this.aSquadre() ? Number(this.idSquadraScelta) : null;

    this.iscrizioniService.iscriviti(this.idTorneo(), idSquadra).subscribe({
      next: risposta => {
        this.inAzione.set(false);
        if (risposta.stato === 'lista_attesa') {
          this.toast.mostra(
            `Torneo completo: sei in lista d'attesa (posizione ${risposta.posizioneAttesa}). Ti avvisiamo se si libera un posto.`,
            'giallo'
          );
        } else {
          this.toast.mostra('Ti sei iscritto con successo!', 'verde');
          this.festa.update(n => n + 1);
        }
        this.ricarica();
      },
      error: err => {
        this.inAzione.set(false);
        // limite di tornei raggiunto (422 con il campo limite)
        if (err.status === 422 && err.error?.limite) {
          this.toast.mostra(`Hai raggiunto il limite di ${err.error.limite} tornei. Disiscriviti da un torneo per iscriverti a un altro.`, 'giallo');
          return;
        }
        this.toast.mostra(err.error?.errore ?? 'Iscrizione non riuscita', 'rosso');
      }
    });
  }

  // delete /api/iscrizioni/{id}
  confermaDisiscrizione() {
    const mia = this.miaIscrizione();
    if (!mia) return;
    this.inAzione.set(true);

    this.iscrizioniService.disiscriviti(mia.id, this.idTorneo()).subscribe({
      next: () => {
        this.inAzione.set(false);
        this.chiediConferma.set(false);
        this.toast.mostra('Partecipazione al torneo annullata.', 'rosso');
        this.ricarica();
      },
      error: err => {
        this.inAzione.set(false);
        this.toast.mostra(err.error?.errore ?? 'Disiscrizione non riuscita', 'rosso');
      }
    });
  }
}
