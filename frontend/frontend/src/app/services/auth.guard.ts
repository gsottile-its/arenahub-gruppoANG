import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

// pagine riservate: senza login si va al login e poi si torna qui
export const loginRichiesto: CanActivateFn = (_rotta, stato) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.loggato() ? true : router.createUrlTree(['/login'], { queryParams: { ritorno: stato.url } });
};
