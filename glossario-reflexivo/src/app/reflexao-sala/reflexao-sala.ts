import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../supabase.service';

interface PerguntaReflexiva {
  id: number;
  texto: string;
}

interface RespostaReflexao {
  id: number | string;
  pergunta_id: number;
  texto: string;
  autor_email?: string;
  status_aprovado?: boolean;
  created_at: string;
}

// Exibe uma pergunta e permite consultar e enviar respostas para moderação.
@Component({
  selector: 'app-reflexao-sala',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './reflexao-sala.html',
  styleUrl: './reflexao-sala.scss',
})
export class ReflexaoSalaComponent implements OnInit, OnDestroy {
  // Os identificadores correspondem às perguntas e aos links do carrossel da página inicial.
  readonly perguntasReflexivas: PerguntaReflexiva[] = [
    {
      id: 1,
      texto:
        'Como o uso da língua pode contribuir para a construção ou para a desconstrução de preconceitos?',
    },
    {
      id: 2,
      texto:
        'Você acha que uma pessoa pode reproduzir uma expressão preconceituosa sem perceber seu significado?',
    },
    {
      id: 3,
      texto:
        'Quais consequências o uso frequente de expressões preconceituosas pode trazer para quem é alvo delas?',
    },
    {
      id: 4,
      texto:
        'Existe diferença entre liberdade de expressão e um discurso que desrespeita ou discrimina alguém?',
    },
    {
      id: 5,
      texto:
        'Depois de conhecer as expressões deste glossário, você mudaria alguma forma de falar? Qual? Por quê?',
    },
  ];

  @ViewChild('feedRespostas')
  private feedRespostas?: ElementRef<HTMLDivElement>;

  perguntaAtual: PerguntaReflexiva | null = null;
  respostas: RespostaReflexao[] = [];
  carregando = true;
  enviando = false;
  erroAoCarregar = false;
  mensagemSucesso = '';
  mensagemErro = '';

  readonly respostaForm = new FormGroup({
    texto: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });

  private rotaSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly supabaseService: SupabaseService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // A sala acompanha a pergunta da rota e recarrega as respostas quando o filtro docente muda.
  ngOnInit(): void {
    this.rotaSubscription = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      void this.selecionarPergunta(id);
    });

    this.supabaseService.filtroProfessor$.subscribe(() => {
      if (this.perguntaAtual) {
        void this.selecionarPergunta(this.perguntaAtual.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.rotaSubscription?.unsubscribe();
  }

  // Registra a resposta como pendente; ela só aparece no feed depois da aprovação.
  async enviarResposta(): Promise<void> {
    if (this.respostaForm.invalid || !this.perguntaAtual || this.enviando) {
      this.respostaForm.markAllAsTouched();
      return;
    }

    const usuario = await this.supabaseService.obterUsuarioAtual();
    const aluno = this.supabaseService.obterSessaoAluno();

    if (!usuario?.email && !aluno) {
      this.mensagemErro = 'Sua sessão expirou. Entre novamente para enviar uma resposta.';
      this.cdr.detectChanges();
      return;
    }

    this.enviando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.cdr.detectChanges();

    try {
      await this.supabaseService.inserirRespostaReflexao({
        pergunta_id: this.perguntaAtual.id,
        texto: this.respostaForm.getRawValue().texto.trim(),
        status_aprovado: false,
        autor_nome: aluno?.nome || null,
        autor_email: usuario?.email || null,
        escola: aluno?.escola || null,
        serie: aluno?.serie || null,
        turma: aluno?.turma || null
      });

      this.respostaForm.reset();
      this.mensagemSucesso =
        'Resposta enviada para moderação. Ela aparecerá na sala após a aprovação.';
    } catch (error) {
      console.error('Erro ao enviar resposta da reflexão:', error);
      this.mensagemErro = 'Não foi possível enviar sua resposta. Tente novamente.';
    } finally {
      this.enviando = false;
      this.cdr.detectChanges();
    }
  }

  // Limpa o estado anterior e busca as respostas da pergunta selecionada na URL.
  private async selecionarPergunta(id: number): Promise<void> {
    this.perguntaAtual = this.perguntasReflexivas.find(pergunta => pergunta.id === id) ?? null;
    this.respostas = [];
    this.erroAoCarregar = false;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!this.perguntaAtual) {
      this.carregando = false;
      this.cdr.detectChanges();
      return;
    }

    this.carregando = true;
    this.cdr.detectChanges();

    try {
      this.respostas = (await this.supabaseService.buscarRespostasReflexao(id)) as RespostaReflexao[];
      setTimeout(() => this.rolarFeedParaOFim());
    } catch (error) {
      console.error('Erro ao carregar respostas da reflexão:', error);
      this.erroAoCarregar = true;
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  // Leva a rolagem até o fim depois que as respostas forem renderizadas.
  private rolarFeedParaOFim(): void {
    const feed = this.feedRespostas?.nativeElement;
    if (feed) {
      feed.scrollTop = feed.scrollHeight;
    }
  }
}
