import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface QuestaoReflexiva {
  numero: number;
  texto: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home implements OnInit, OnDestroy {
  // As mesmas perguntas aparecem nas salas de reflexão.
  readonly questoesReflexivas: QuestaoReflexiva[] = [
    {
      numero: 1,
      texto:
        'Como o uso da língua pode contribuir para a construção ou para a desconstrução de preconceitos?',
    },
    {
      numero: 2,
      texto:
        'Você acha que uma pessoa pode reproduzir uma expressão preconceituosa sem perceber seu significado?',
    },
    {
      numero: 3,
      texto:
        'Quais consequências o uso frequente de expressões preconceituosas pode trazer para quem é alvo delas?',
    },
    {
      numero: 4,
      texto:
        'Existe diferença entre liberdade de expressão e um discurso que desrespeita ou discrimina alguém?',
    },
    {
      numero: 5,
      texto:
        'Depois de conhecer as expressões deste glossário, você mudaria alguma forma de falar? Qual? Por quê?',
    },
  ];

  indiceQuestaoAtiva = 0;
  carrosselEmExecucao = true;

  private intervaloCarrossel?: ReturnType<typeof setInterval>;
  private inicioToque = 0;

  ngOnInit(): void {
    this.iniciarCarrossel();
  }

  ngOnDestroy(): void {
    this.pararIntervalo();
  }

  selecionarQuestao(indice: number): void {
    this.indiceQuestaoAtiva = indice;
    this.pararCarrossel();
  }

  proximaQuestao(): void {
    this.indiceQuestaoAtiva =
      (this.indiceQuestaoAtiva + 1) % this.questoesReflexivas.length;
  }

  questaoAnterior(): void {
    this.indiceQuestaoAtiva =
      (this.indiceQuestaoAtiva - 1 + this.questoesReflexivas.length) %
      this.questoesReflexivas.length;
  }

  iniciarToque(event: TouchEvent): void {
    this.inicioToque = event.changedTouches[0]?.clientX ?? 0;
  }

  finalizarToque(event: TouchEvent): void {
    const fimToque = event.changedTouches[0]?.clientX ?? this.inicioToque;
    const distancia = fimToque - this.inicioToque;

    if (Math.abs(distancia) < 50) return;

    if (distancia < 0) {
      this.proximaQuestao();
    } else {
      this.questaoAnterior();
    }

    this.pararCarrossel();
  }

  @HostListener('window:keydown', ['$event'])
  controlarComTeclado(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    if (event.key === 'ArrowRight') {
      this.proximaQuestao();
    } else {
      this.questaoAnterior();
    }
    this.pararCarrossel();
  }

  private iniciarCarrossel(): void {
    this.intervaloCarrossel = setInterval(() => {
      this.proximaQuestao();
    }, 5000);
  }

  private pararCarrossel(): void {
    this.carrosselEmExecucao = false;
    this.pararIntervalo();
  }

  private pararIntervalo(): void {
    if (!this.intervaloCarrossel) return;

    clearInterval(this.intervaloCarrossel);
    this.intervaloCarrossel = undefined;
  }
}
