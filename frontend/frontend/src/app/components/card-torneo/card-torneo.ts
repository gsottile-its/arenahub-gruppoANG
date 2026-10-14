import { Component, computed, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TorneoCard } from '../../models/torneo';
import { Icona } from '../icona/icona';

const TESTI_STATO: Record<string, string> = {
  bozza: 'Bozza',
  iscrizioni_aperte: 'Iscrizioni aperte',
  iscrizioni_chiuse: 'Iscrizioni chiuse',
  in_corso: 'In corso',
  concluso: 'Concluso',
  annullato: 'Cancellato'
};

@Component({
  selector: 'app-card-torneo',
  imports: [NgTemplateOutlet, Icona],
  templateUrl: './card-torneo.html',
  styleUrl: './card-torneo.css'
})
export class CardTorneo {
  torneo = input.required<TorneoCard>();
  vista = input<'griglia' | 'lista'>('griglia');
  apri = output<number>();

  pieno = computed(() => this.torneo().iscritti >= this.torneo().postiMax);
  formato = computed(() => `${this.torneo().giocatoriPerSquadra} vs ${this.torneo().giocatoriPerSquadra}`);

  // chip in alto sulla card: lo stato del torneo, oppure "al completo" se non ci sono più posti
  chip = computed(() => {
    const t = this.torneo();
    if (t.stato === 'iscrizioni_aperte' && this.pieno()) return { testo: 'Al completo', classe: 'completo' };
    return { testo: TESTI_STATO[t.stato] ?? t.stato, classe: t.stato };
  });

  pulsante = computed(() => {
    const t = this.torneo();
    if (t.mioStato === 'confermata' || t.mioStato === 'in_attesa') return 'Disiscriviti';
    if (t.mioStato === 'lista_attesa') return 'In attesa';
    if (t.stato !== 'iscrizioni_aperte') return 'Dettagli';
    return this.pieno() ? "In lista d'attesa" : 'Iscriviti';
  });
}
