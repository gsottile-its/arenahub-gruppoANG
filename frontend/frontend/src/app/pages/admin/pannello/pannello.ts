import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-pannello-admin',
  imports: [RouterLink],
  templateUrl: './pannello.html',
  styleUrl: './pannello.css'
})
export class PannelloAdmin {
  protected auth = inject(AuthService);
}
