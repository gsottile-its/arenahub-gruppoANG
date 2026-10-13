import { Injectable, signal } from '@angular/core';

export type ColoreToast = 'verde' | 'giallo' | 'rosso';

export interface Toast {
  id: number;
  testo: string;
  colore: ColoreToast;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messaggi = signal<Toast[]>([]);
  private ultimoId = 0;

  mostra(testo: string, colore: ColoreToast = 'verde') {
    const id = ++this.ultimoId;
    this.messaggi.update(lista => [...lista, { id, testo, colore }]);
    setTimeout(() => this.chiudi(id), 4500);
  }

  chiudi(id: number) {
    this.messaggi.update(lista => lista.filter(m => m.id !== id));
  }
}
