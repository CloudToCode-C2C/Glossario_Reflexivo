import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface QuestaoReflexiva {
  numero: number;
  texto: string;
}

// Controla a navegação automática e manual das perguntas da página inicial.
@Component({
  imports: [RouterLink],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home implements OnInit, OnDestroy {
  // Os números também são usados como identificadores das salas de reflexão.
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

  // O temporizador acompanha o ciclo de vida do componente para não ficar ativo fora da tela.
  ngOnInit(): void {
    this.iniciarCarrossel();
  }

  ngOnDestroy(): void {
    this.pararIntervalo();
  }

  // A escolha manual pausa o avanço automático para dar tempo de ler a pergunta.
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

  // Guarda a coordenada inicial para identificar a direção do gesto ao terminar.
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

  // As setas oferecem a mesma navegação do gesto, sem depender de toque ou mouse.
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

  // Enquanto ninguém interage, mostra a próxima pergunta a cada cinco segundos.
  private iniciarCarrossel(): void {
    this.intervaloCarrossel = setInterval(() => {
      this.proximaQuestao();
    }, 5000);
  }

  // Atualiza o indicador do carrossel e encerra o temporizador quando há interação.
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
