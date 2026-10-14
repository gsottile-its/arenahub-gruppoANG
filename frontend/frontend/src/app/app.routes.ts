import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Tornei } from './pages/tornei/tornei';
import { Login } from './pages/login/login';
import { Registrazione } from './pages/registrazione/registrazione';
import { MieiTornei } from './pages/miei-tornei/miei-tornei';
import { Profilo } from './pages/profilo/profilo';
import { NonTrovata } from './pages/non-trovata/non-trovata';
import { PannelloAdmin } from './pages/admin/pannello/pannello';
import { GestioneTornei } from './pages/admin/gestione-tornei/gestione-tornei';
import { FormTorneo } from './pages/admin/form-torneo/form-torneo';
import { GestisciTorneo } from './pages/admin/gestisci-torneo/gestisci-torneo';
import { adminRichiesto, loginRichiesto } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'tornei', component: Tornei },
  { path: 'login', component: Login },
  { path: 'registrazione', component: Registrazione },
  { path: 'miei-tornei', component: MieiTornei, canActivate: [loginRichiesto] },
  { path: 'profilo', component: Profilo, canActivate: [loginRichiesto] },
  { path: 'admin', component: PannelloAdmin, canActivate: [adminRichiesto] },
  { path: 'admin/tornei', component: GestioneTornei, canActivate: [adminRichiesto] },
  { path: 'admin/tornei/nuovo', component: FormTorneo, canActivate: [adminRichiesto] },
  { path: 'admin/tornei/:id', component: GestisciTorneo, canActivate: [adminRichiesto] },
  { path: 'admin/tornei/:id/modifica', component: FormTorneo, canActivate: [adminRichiesto] },
  { path: '**', component: NonTrovata }
];
