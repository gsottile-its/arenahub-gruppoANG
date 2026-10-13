import { Component, inject } from '@angular/core';
import { TorneiService } from '../../services/tornei';
import { CaricaTornei, ElencoTornei } from '../../components/elenco-tornei/elenco-tornei';

@Component({
  selector: 'app-miei-tornei',
  imports: [ElencoTornei],
  templateUrl: './miei-tornei.html'
})
export class MieiTornei {
  private torneiService = inject(TorneiService);
  carica: CaricaTornei = (stato, pagina) => this.torneiService.getTornei(stato, pagina, true);
}
