import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AuthService } from '../../services/auth';
import { CataloghiService } from '../../services/cataloghi';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  protected auth = inject(AuthService);

  // sezione chi siamo dentro il banner its
  chiSiamoAperto = signal(false);

  paroleNastro = ['Gioca', 'Competi', 'Vinci', 'Scala il tabellone', "Entra nell'arena"];

  // finché non arrivano i dati restano a zero, se la richiesta fallisce la sezione sparisce
  private cataloghi = inject(CataloghiService);
  numeri = toSignal(
    forkJoin({
      giochi: this.cataloghi.getGiochi(),
      piattaforme: this.cataloghi.getPiattaforme(),
      tipologie: this.cataloghi.getTipologie()
    }).pipe(
      map(r => [
        { valore: r.giochi.length, etichetta: 'Giochi' },
        { valore: r.piattaforme.length, etichetta: 'Piattaforme' },
        { valore: r.tipologie.length, etichetta: 'Generi' }
      ]),
      catchError(() => of(null))
    ),
    {
      initialValue: [
        { valore: 0, etichetta: 'Giochi' },
        { valore: 0, etichetta: 'Piattaforme' },
        { valore: 0, etichetta: 'Generi' }
      ]
    }
  );

  giochi = [
    { nome: 'Valorant', immagine: 'img/giochi/valorant.webp' },
    { nome: 'League of Legends', immagine: 'img/giochi/league-of-legends.webp' },
    { nome: 'Counter-Strike 2', immagine: 'img/giochi/counter-strike-2.webp' },
    { nome: 'Rocket League', immagine: 'img/giochi/rocket-league.webp' },
    { nome: 'EA Sports FC', immagine: 'img/giochi/ea-sports-fc.webp' },
    { nome: 'Street Fighter 6', immagine: 'img/giochi/street-fighter-6.webp' },
    { nome: 'Overwatch 2', immagine: 'img/giochi/overwatch-2.webp' },
    { nome: 'Apex Legends', immagine: 'img/giochi/apex-legends.webp' },
    { nome: 'Mario Kart', immagine: 'img/giochi/mario-kart.webp' },
    { nome: 'Super Smash Bros.', immagine: 'img/giochi/super-smash-bros-ultimate.webp' }
  ];

  constructor() {
    const pagina = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    // quando un elemento entra nello schermo parte la sua animazione
    afterNextRender(() => {
      const osservatore = new IntersectionObserver(voci => {
        for (const voce of voci) {
          if (voce.isIntersecting) {
            voce.target.classList.add('visibile');
            osservatore.unobserve(voce.target);
          }
        }
      }, { threshold: 0.2 });

      pagina.querySelectorAll('.rivela').forEach(el => osservatore.observe(el));
      destroyRef.onDestroy(() => osservatore.disconnect());
    });
  }

  // testi provvisori della presentazione sotto il video
  blocchi = [
    {
      titolo: 'Un torneo per ogni gioco',
      testo: 'Sparatutto, picchiaduro, corse o sport: scegli la tua specialità, controlla i posti liberi e iscriviti in pochi clic.',
      parola: 'Gioca',
      immagine: 'img/home/gioca.webp',
      azione: 'Scopri i tornei',
      link: '/tornei',
      icona: 'M14 16h20a8 8 0 0 1 8 8v6a6 6 0 0 1-10.8 3.6L28 30h-8l-3.2 3.6A6 6 0 0 1 6 30v-6a8 8 0 0 1 8-8Zm2 5v3h-3v3h3v3h3v-3h3v-3h-3v-3Zm15 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm4 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z'
    },
    {
      titolo: 'Da solo o con la tua squadra',
      testo: "Uno contro uno o cinque contro cinque: entri con il tuo nickname o con il team di cui sei capitano. Torneo pieno? Ti mettiamo in lista d'attesa.",
      parola: 'Team',
      immagine: 'img/home/team.webp',
      azione: 'Crea il tuo account',
      link: '/registrazione',
      icona: 'M24 6a7 7 0 1 1 0 14 7 7 0 0 1 0-14ZM10 12a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm28 0a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM24 23c7.7 0 13 4 13 9v6H11v-6c0-5 5.3-9 13-9ZM10 25c1 0 2 .1 2.9.4A11 11 0 0 0 8 32v6H2v-5c0-4.4 3.6-8 8-8Zm28 0c4.4 0 8 3.6 8 8v5h-6v-6a11 11 0 0 0-4.9-6.6c.9-.3 1.9-.4 2.9-.4Z'
    },
    {
      titolo: 'Scala il tabellone',
      testo: 'Ogni partita è a eliminazione diretta: vinci, passi al turno successivo e ti avvicini al montepremi. Fino alla finale.',
      parola: 'Vinci',
      immagine: 'img/home/vinci.webp',
      azione: 'I miei tornei',
      link: '/miei-tornei',
      icona: 'M14 6h20v4h8v6a9 9 0 0 1-8.4 9A11 11 0 0 1 27 32.6V36h6v6H15v-6h6v-3.4A11 11 0 0 1 14.4 25 9 9 0 0 1 6 16v-6h8Zm0 8h-4v2a5 5 0 0 0 4 4.9Zm20 0v6.9a5 5 0 0 0 4-4.9v-2Z'
    }
  ];
}
