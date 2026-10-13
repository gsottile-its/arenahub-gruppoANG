import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { DatiProfilo, Utente } from '../../models/utente';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { FORMATO_EMAIL } from '../login/login';

@Component({
  selector: 'app-profilo',
  imports: [FormsModule],
  templateUrl: './profilo.html'
})
export class Profilo {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private location = inject(Location);

  private originale: Utente | null = null;

  nickname = '';
  email = '';
  nome = '';
  cognome = '';
  nuovaPassword = '';
  confermaPassword = '';

  caricamento = signal(true);
  salvataggio = signal(false);
  inviato = signal(false);
  erroreServer = signal<string | null>(null);
  campoServer = signal<string | null>(null);

  constructor() {
    this.auth.me().subscribe({
      next: utente => {
        this.riempi(utente);
        this.caricamento.set(false);
      },
      error: err => {
        this.erroreServer.set(err.error?.errore ?? 'Impossibile caricare il profilo');
        this.caricamento.set(false);
      }
    });
  }

  private riempi(utente: Utente) {
    this.originale = utente;
    this.nickname = utente.nickname;
    this.email = utente.email;
    this.nome = utente.nome;
    this.cognome = utente.cognome;
    this.nuovaPassword = '';
    this.confermaPassword = '';
  }

  errori() {
    return {
      nickname: this.nickname.trim().length < 3 || this.nickname.trim().length > 20 ? 'Da 3 a 20 caratteri' : null,
      email: !FORMATO_EMAIL.test(this.email) ? "Inserisci un'email valida" : null,
      nome: this.nome.trim() === '' ? 'Il nome è obbligatorio' : null,
      cognome: this.cognome.trim() === '' ? 'Il cognome è obbligatorio' : null,

      nuovaPassword: this.nuovaPassword !== '' && this.nuovaPassword.length < 8 ? 'Almeno 8 caratteri' : null,
      confermaPassword: this.confermaPassword !== this.nuovaPassword ? 'Le password non coincidono' : null
    };
  }

  sbagliato(campo: keyof ReturnType<Profilo['errori']>) {
    return (this.inviato() && this.errori()[campo] !== null) || this.campoServer() === campo;
  }

  salva() {
    this.inviato.set(true);
    this.erroreServer.set(null);
    this.campoServer.set(null);
    if (!this.originale || !Object.values(this.errori()).every(e => e === null)) return;

    const cambiati: DatiProfilo = {};
    if (this.nickname.trim() !== this.originale.nickname) cambiati.nickname = this.nickname.trim();
    if (this.email.trim() !== this.originale.email) cambiati.email = this.email.trim();
    if (this.nome.trim() !== this.originale.nome) cambiati.nome = this.nome.trim();
    if (this.cognome.trim() !== this.originale.cognome) cambiati.cognome = this.cognome.trim();
    if (this.nuovaPassword !== '') cambiati.password = this.nuovaPassword;

    if (Object.keys(cambiati).length === 0) {
      this.toast.mostra('Non hai modificato nessun dato', 'giallo');
      return;
    }

    this.salvataggio.set(true);
    this.auth.aggiornaProfilo(cambiati).subscribe({
      next: utente => {
        this.riempi(utente);
        this.inviato.set(false);
        this.salvataggio.set(false);
        this.toast.mostra('Profilo aggiornato!', 'verde');
      },
      error: err => {
        this.salvataggio.set(false);
        this.erroreServer.set(err.error?.errore ?? 'Salvataggio non riuscito. Riprova più tardi.');
        this.campoServer.set(err.error?.campo ?? null);
      }
    });
  }

  annulla() {
    this.location.back();
  }
}
