import { Component, input } from '@angular/core';

export type NomeIcona =
  | 'giocatori' | 'piattaforme' | 'posti'
  | 'tutti' | 'iscrizioni_aperte' | 'in_corso' | 'concluso' | 'annullato';

// icone a linea, prendono il colore del testo intorno
@Component({
  selector: 'app-icona',
  templateUrl: './icona.html',
  styles: `
    :host { display: inline-flex; flex-shrink: 0; }
    .contenitore { display: inline-flex; }
    svg { width: 1.1em; height: 1.1em; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  `
})
export class Icona {
  nome = input.required<NomeIcona>();
}
