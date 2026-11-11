import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

export interface DadosGiria {
  id?: number | string;
  expressao: string;
  significado: string;
  contexto: string;
  data_criacao: Date | string;
}

// Este componente recebe os dados de um verbete e cuida apenas da sua apresentação.
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