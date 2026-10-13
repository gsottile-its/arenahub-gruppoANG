import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { EMAIL_PROVA, PASSWORD_PROVA } from '../../services/mock-db';

export const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private ritorno = inject(ActivatedRoute).snapshot.queryParamMap.get('ritorno');

  email = '';
  password = '';

  inviato = signal(false);
  caricamento = signal(false);
  erroreServer = signal<string | null>(null);

  modalitaMock = environment.useMock;
  emailProva = EMAIL_PROVA;
  passwordProva = PASSWORD_PROVA;

  emailValida() {
    return FORMATO_EMAIL.test(this.email);
  }

  accedi() {
    this.inviato.set(true);
    this.erroreServer.set(null);
    if (!this.emailValida() || this.password === '') return;

    this.caricamento.set(true);
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: risposta => {
        this.caricamento.set(false);
        this.toast.mostra(`Bentornato/a, ${risposta.utente.nickname}!`, 'verde');

        const ritorno = this.ritorno ?? '';
        const destinazione = ritorno.startsWith('/') ? ritorno : '/';
        this.router.navigateByUrl(destinazione);
      },
      error: err => {

        this.password = '';
        this.caricamento.set(false);
        this.erroreServer.set(err.error?.errore ?? 'Accesso non riuscito. Riprova più tardi.');
      }
    });
  }
}
