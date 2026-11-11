import { Component, Input } from '@angular/core';

export interface Verbete {
  id: number;
  expressao: string;
  significado: string;
  contexto: string;
  data_criacao: Date;
}

@Component({
  selector: 'app-mural',
  standalone: true,
  templateUrl: './mural.html',
  styleUrls: ['./mural.css'],
})
export class MuralComponent {
  @Input() categoriaFiltro!: string;

  // Dados de exemplo enquanto o mural não usa o serviço.
  verbetesMock: Verbete[] = [
    {
      id: 1,
      expressao: 'Isso é coisa de velho!',
      significado: 'Desqualifica a opinião baseada na idade.',
      contexto: 'Etarismo',
      data_criacao: new Date()
    },
    {
      id: 2,
      expressao: 'Cringe',
      significado: 'Usado para inferiorizar comportamentos de gerações mais velhas.',
      contexto: 'Etarismo',
      data_criacao: new Date()
    },
    {
      id: 3,
      expressao: 'Ele é autista',
      significado: 'Uso de uma neurodivergência como xingamento.',
      contexto: 'Capacitismo',
      data_criacao: new Date()
    }
  ];

  get verbetesFiltrados(): Verbete[] {
    if (!this.categoriaFiltro) return this.verbetesMock;
    return this.verbetesMock.filter(
      verbete => verbete.contexto === this.categoriaFiltro
    );
  }
}