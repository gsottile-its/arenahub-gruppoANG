import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { AdminService } from '../../../services/admin';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-pannello-admin',
  imports: [RouterLink, FormsModule],
  templateUrl: './pannello.html',
  styleUrl: './pannello.css'
})
export class PannelloAdmin {
  protected auth = inject(AuthService);
  private admin = inject(AdminService);
  private toast = inject(ToastService);

  // limite di tornei per utente, uguale per tutti
  limite: number | null = null;
  limiteCaricato = signal(false);
  salvataggio = signal(false);
  erroreLimite = signal<string | null>(null);

  constructor() {
    this.admin.getLimiteIscrizioni().subscribe({
      next: r => {
        this.limite = r.maxTorneiPerUtente;
        this.limiteCaricato.set(true);
      },
      error: () => this.erroreLimite.set('Impossibile caricare il limite attuale')
    });
  }

  // put /api/configurazione/limite-iscrizioni
  salvaLimite() {
    this.erroreLimite.set(null);
    const valore = Number(this.limite);
    if (!Number.isInteger(valore) || valore < 1) {
      this.erroreLimite.set('Il limite deve essere un intero maggiore o uguale a 1');
      return;
    }

    this.salvataggio.set(true);
    this.admin.aggiornaLimiteIscrizioni(valore).subscribe({
      next: r => {
        this.limite = r.maxTorneiPerUtente;
        this.salvataggio.set(false);
        this.toast.mostra(`Limite aggiornato: ora ogni utente può iscriversi a ${r.maxTorneiPerUtente} tornei!`, 'verde');
      },
      error: err => {
        this.salvataggio.set(false);
        this.erroreLimite.set(err.error?.errore ?? 'Salvataggio non riuscito. Riprova più tardi.');
      }
    });
  }
}
