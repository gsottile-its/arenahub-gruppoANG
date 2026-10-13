import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { FORMATO_EMAIL } from '../login/login';

@Component({
  selector: 'app-registrazione',
  imports: [FormsModule, RouterLink],
  templateUrl: './registrazione.html'
})
export class Registrazione {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = '';
  nickname = '';
  nome = '';
  cognome = '';
  password = '';
  confermaPassword = '';

  inviato = signal(false);
  caricamento = signal(false);
  erroreServer = signal<string | null>(null);
  campoServer = signal<string | null>(null);

  errori() {
    return {
      email: !FORMATO_EMAIL.test(this.email) ? "Inserisci un'email valida" : null,
      nickname: this.nickname.trim().length < 3 || this.nickname.trim().length > 20 ? 'Da 3 a 20 caratteri' : null,
      nome: this.nome.trim() === '' ? 'Il nome è obbligatorio' : null,
      cognome: this.cognome.trim() === '' ? 'Il cognome è obbligatorio' : null,
      password: this.password.length < 8 ? 'Almeno 8 caratteri' : null,
      confermaPassword: this.confermaPassword !== this.password ? 'Le password non coincidono' : null
    };
  }

  valido() {
    return Object.values(this.errori()).every(e => e === null);
  }

  sbagliato(campo: keyof ReturnType<Registrazione['errori']>) {
    return (this.inviato() && this.errori()[campo] !== null) || this.campoServer() === campo;
  }

  iscriviti() {
    this.inviato.set(true);
    this.erroreServer.set(null);
    this.campoServer.set(null);
    if (!this.valido()) return;

    this.caricamento.set(true);
    this.auth.registrazione({
      email: this.email.trim(),
      nickname: this.nickname.trim(),
      nome: this.nome.trim(),
      cognome: this.cognome.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.caricamento.set(false);
        this.toast.mostra('Account creato! Ora puoi accedere.', 'verde');
        this.router.navigate(['/login']);
      },
      error: err => {

        this.caricamento.set(false);
        this.erroreServer.set(err.error?.errore ?? 'Registrazione non riuscita. Riprova più tardi.');
        this.campoServer.set(err.error?.campo ?? null);
      }
    });
  }
}
