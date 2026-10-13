import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Tornei } from './pages/tornei/tornei';
import { Login } from './pages/login/login';
import { Registrazione } from './pages/registrazione/registrazione';
import { MieiTornei } from './pages/miei-tornei/miei-tornei';
import { Profilo } from './pages/profilo/profilo';
import { NonTrovata } from './pages/non-trovata/non-trovata';
import { loginRichiesto } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'tornei', component: Tornei },
  { path: 'login', component: Login },
  { path: 'registrazione', component: Registrazione },
  { path: 'miei-tornei', component: MieiTornei, canActivate: [loginRichiesto] },
  { path: 'profilo', component: Profilo, canActivate: [loginRichiesto] },
  { path: '**', component: NonTrovata }
];
