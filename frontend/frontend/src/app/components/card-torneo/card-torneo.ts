import { Component, computed, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TorneoCard } from '../../models/torneo';

@Component({
  selector: 'app-card-torneo',
  imports: [NgTemplateOutlet],
  templateUrl: './card-torneo.html',
  styleUrl: './card-torneo.css'
})
export class CardTorneo {
  torneo = input.required<TorneoCard>();
  vista = input<'griglia' | 'lista'>('griglia');
  apri = output<number>();

  pieno = computed(() => this.torneo().iscritti >= this.torneo().postiMax);
  formato = computed(() => `${this.torneo().giocatoriPerSquadra} vs ${this.torneo().giocatoriPerSquadra}`);

  pulsante = computed(() => {
    const t = this.torneo();
    if (t.mioStato === 'confermata' || t.mioStato === 'in_attesa') return 'Disiscriviti';
    if (t.mioStato === 'lista_attesa') return 'In attesa';
    if (t.stato !== 'iscrizioni_aperte') return 'Dettagli';
    return this.pieno() ? 'Completo' : 'Iscriviti';
  });
}
