import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CardGiriaComponent } from '../card-giria/card-giria'; 

@Component({
  selector: 'app-glossario',
  standalone: true,
  imports: [CommonModule, CardGiriaComponent], 
  templateUrl: './glossario.html',
  styleUrl: './glossario.scss'
})
export class GlossarioComponent {
  
  termoBusca: string = '';

  listaDePalavras = [
    {
      expressao: 'Criado-Mudo',
      contexto: 'Racismo',
      significado: 'Referência aos escravizados que ficavam parados ao lado da cama segurando objetos para os seus senhores.',
      data_criacao: new Date('2023-05-10')
    },
    {
      expressao: 'Denegrir',
      contexto: 'Racismo',
      significado: 'Usado de forma pejorativa como algo que mancha a reputação de alguém. Prefira usar "Difamar".',
      data_criacao: new Date('2023-06-15')
    },
    {
      expressao: 'João sem braço',
      contexto: 'Capacitismo',
      significado: 'Usada para alguém que finge não entender algo ou tenta escapar de uma obrigação, ofendendo pessoas amputadas.',
      data_criacao: new Date('2023-08-22')
    },
    {
      expressao: 'Mercado Negro',
      contexto: 'Racismo',
      significado: 'Associa a palavra "negro" a algo ilegal, clandestino ou ruim. Prefira usar "Mercado clandestino".',
      data_criacao: new Date('2023-09-01')
    }
  ];

  // A lista que será exibida na tela. Inicia com todos os itens.
  listaFiltrada = [...this.listaDePalavras];

  filtrarPalavras(event: Event) {
    const elemento = event.target as HTMLInputElement;
    const busca = elemento.value.toLowerCase();
    this.termoBusca = busca;

    if (!busca) {
      this.listaFiltrada = [...this.listaDePalavras];
      return;
    }

    this.listaFiltrada = this.listaDePalavras.filter(item => {
      return item.expressao.toLowerCase().includes(busca) || 
             item.contexto.toLowerCase().includes(busca);
    });
  }
}