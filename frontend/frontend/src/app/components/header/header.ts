import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  protected auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected menuAperto = signal(false);

  apriChiudiMenu() {
    this.menuAperto.update(aperto => !aperto);
  }

  logout() {
    this.auth.logout();
    this.menuAperto.set(false);
    this.toast.mostra('Sei uscito dal tuo account', 'verde');
    this.router.navigate(['/']);
  }
}
