import { HttpInterceptorFn } from '@angular/common/http';
import { CHIAVE_TOKEN } from './auth';


export const authInterceptor: HttpInterceptorFn = (richiesta, prossimo) => {
  let token: string | null = null;
  try { token = localStorage.getItem(CHIAVE_TOKEN); } catch {}

  if (!token || richiesta.url.startsWith('mock/')) {
    return prossimo(richiesta);
  }
  return prossimo(richiesta.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
