import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

export interface DadosGiria {
  id?: number | string;
  expressao: string;
  significado: string;
  contexto: string;
  data_criacao: Date | string;
}

@Component({
  selector: 'app-card-giria',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './card-giria.html',
  styleUrls: ['./card-giria.scss']
})
export class CardGiriaComponent {
  @Input() dadosGiria!: DadosGiria;
}