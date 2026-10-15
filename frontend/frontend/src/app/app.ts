import { Component, afterNextRender, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import Lenis from 'lenis';
import { Header } from './components/header/header';
import { ToastComponent } from './components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Header, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private lenis: Lenis | null = null;

  constructor() {
    const router = inject(Router);

    afterNextRender(() => {
      // scorrimento morbido in tutto il sito (si spegne da solo con "riduci animazioni")
      const lenis = new Lenis({ autoRaf: true, allowNestedScroll: true });
      this.lenis = lenis;

      // cambiando pagina torna in cima e passano i pannelli (non se cambiano solo i parametri, es. popup torneo)
      const transizione = document.querySelector('.transizione')!;
      let percorso = '';
      router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(e => {
          const nuovo = e.urlAfterRedirects.split('?')[0];
          if (nuovo !== percorso) {
            lenis.scrollTo(0, { immediate: true });
            transizione.classList.remove('attiva');
            void transizione.clientWidth;
            transizione.classList.add('attiva');
          }
          percorso = nuovo;
        });
    });
  }

  tornaSu() {
    if (this.lenis) this.lenis.scrollTo(0);
    else scrollTo({ top: 0 });
  }
}
