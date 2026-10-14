import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

// pagine riservate: senza login si va al login e poi si torna qui
// area admin: chi non è admin torna alla home (le api rispondono comunque 403)
export const adminRichiesto: CanActivateFn = (_rotta, stato) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.loggato()) return router.createUrlTree(['/login'], { queryParams: { ritorno: stato.url } });
  return auth.admin() ? true : router.createUrlTree(['/']);
};

export const loginRichiesto: CanActivateFn = (_rotta, stato) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.loggato() ? true : router.createUrlTree(['/login'], { queryParams: { ritorno: stato.url } });
};
