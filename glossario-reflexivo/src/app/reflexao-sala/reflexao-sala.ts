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

// Sala de debate vinculada a uma pergunta e às respostas persistidas no Supabase.
@Component({
  selector: 'app-reflexao-sala',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './reflexao-sala.html',
  styleUrl: './reflexao-sala.scss',
})
export class ReflexaoSalaComponent implements OnInit, OnDestroy {
  // O mesmo conjunto de perguntas usado no carrossel da página inicial.
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

  // Observa a rota para trocar a pergunta sem recriar a página inteira.
  ngOnInit(): void {
    this.rotaSubscription = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      void this.selecionarPergunta(id);
    });
  }

  ngOnDestroy(): void {
    this.rotaSubscription?.unsubscribe();
  }

  // Envia respostas pendentes e informa ao usuário o resultado da operação.
  async enviarResposta(): Promise<void> {
    if (this.respostaForm.invalid || !this.perguntaAtual || this.enviando) {
      this.respostaForm.markAllAsTouched();
      return;
    }

    const usuario = await this.supabaseService.obterUsuarioAtual();
    if (!usuario?.email) {
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
        autor_email: usuario.email,
        status_aprovado: false,
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

  // Resolve a pergunta da rota e carrega somente as respostas correspondentes.
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

  // Mantém a resposta mais recente visível depois que o feed é renderizado.
  private rolarFeedParaOFim(): void {
    const feed = this.feedRespostas?.nativeElement;
    if (feed) {
      feed.scrollTop = feed.scrollHeight;
    }
  }
}
