import { Component, inject } from '@angular/core';
import { TorneiService } from '../../services/tornei';
import { CaricaTornei, ElencoTornei } from '../../components/elenco-tornei/elenco-tornei';

@Component({
  selector: 'app-tornei',
  imports: [ElencoTornei],
  templateUrl: './tornei.html'
})
export class Tornei {
  private torneiService = inject(TorneiService);
  carica: CaricaTornei = (stato, pagina) => this.torneiService.getTornei(stato, pagina);
}
