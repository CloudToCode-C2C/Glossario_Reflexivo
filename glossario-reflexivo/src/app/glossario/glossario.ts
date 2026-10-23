import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CardGiriaComponent } from '../card-giria/card-giria'; // Confirme se o caminho está certo

@Component({
  selector: 'app-glossario',
  standalone: true,
  imports: [CommonModule, CardGiriaComponent], 
  templateUrl: './glossario.html',
  styleUrl: './glossario.scss'
})
export class GlossarioComponent {
  
  // A lista de expressões ajustada 
  listaDePalavras = [
    {
      expressao: 'Criado-Mudo',
      contexto: 'Racismo',
      significado: 'O termo faz referência aos escravizados que ficavam parados ao lado da cama segurando objetos para os seus "senhores". Prefira usar "Mesa de cabeceira".',
      data_criacao: new Date('2023-05-10')
    },
    {
      expressao: 'Denegrir',
      contexto: 'Racismo',
      significado: 'Vem de "tornar negro", usado de forma pejorativa como algo que mancha a reputação de alguém. Prefira usar "Difamar".',
      data_criacao: new Date('2023-06-15')
    },
    {
      expressao: 'João sem braço',
      contexto: 'Capacitismo',
      significado: 'Expressão usada para alguém que finge não entender algo ou tenta escapar de uma obrigação, ofendendo pessoas amputadas ou com deficiência.',
      data_criacao: new Date('2023-08-22')
    },
    {
      expressao: 'Mercado Negro',
      contexto: 'Racismo',
      significado: 'Associa a palavra "negro" a algo ilegal, clandestino ou ruim. Prefira usar "Mercado clandestino".',
      data_criacao: new Date('2023-09-01')
    }
  ];

}