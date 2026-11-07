import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  SupabaseService,
  SERIES_PERMITIDAS,
  TURMAS_PERMITIDAS,
  EMAIL_SUPORTE_C2C,
} from '../supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  solicitacaoForm: FormGroup;
  escolas: string[] = [];
  series = SERIES_PERMITIDAS;
  turmas = TURMAS_PERMITIDAS;

  carregando = false;
  verificandoSessao = true;
  erroLogin = false;
  erroMensagem = '';
  enviandoSolicitacao = false;
  feedbackSolicitacao: { tipo: 'sucesso' | 'erro' | 'info'; texto: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.loginForm = this.fb.group({
      perfil: ['ALUNO', Validators.required],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      escola: [this.escolas[0], Validators.required],
      serie: [this.series[0], Validators.required],
      turma: [this.turmas[0], Validators.required],
    });
    this.solicitacaoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      escolaSelecionada: ['', Validators.required],
      novaEscolaNome: [''],
      novaEscolaCidade: [''],
    });
  }

  async ngOnInit() {
    this.supabaseService.escolasPermitidas$.subscribe((lista) => {
      this.escolas = lista;
      if (lista.length > 0 && !this.loginForm.get('escola')?.value) {
        this.loginForm.patchValue({ escola: lista[0] });
        this.solicitacaoForm.patchValue({ escolaSelecionada: lista[0] });
      }
      this.cdr.detectChanges();
    });
    try {
      await this.supabaseService.carregarEscolasAprovadas();

      // 1. Verifica se há retorno de OAuth do Professor
      const session = await this.supabaseService.obterSessao();
      if (session) {
        const autorizado = await this.supabaseService.verificarProfessorAutorizado();
        if (autorizado) {
          this.router.navigate(['/glossario']);
          return;
        } else {
          // Tem sessão Google, mas o e-mail não está na função is_admin() do banco
          await this.supabaseService.limparSessaoCompleta();
          this.loginForm.patchValue({ perfil: 'PROFESSOR' });
          this.erroLogin = true;
          this.erroMensagem =
            'Acesso negado: seu e-mail não consta na lista de professores autorizados pela CloudToCode.';
        }
      } else {
        // 2. Se já houver sessão de aluno válida no LocalStorage, redireciona direto
        const sessaoAluno = this.supabaseService.obterSessaoAluno();
        if (sessaoAluno?.nome && sessaoAluno?.escola) {
          this.router.navigate(['/glossario']);
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar sessão inicial:', error);
    } finally {
      this.verificandoSessao = false;
      this.cdr.detectChanges();
    }
  }

  get perfilAtual(): 'ALUNO' | 'PROFESSOR' {
    return this.loginForm.get('perfil')?.value;
  }

  get linkMailtoC2C(): string {
    const assunto = encodeURIComponent('Solicitação de Acesso Professor - Glossário Reflexivo');
    const corpo = encodeURIComponent(
      'Olá equipe CloudToCode,\n\nSolicito a liberação do meu e-mail institucional na lista de professores autorizados.\n\nNome Completo:\nInstituição de Ensino:\nE-mail Google:',
    );
    return `mailto:${EMAIL_SUPORTE_C2C}?subject=${assunto}&body=${corpo}`;
  }

  selecionarPerfil(perfil: 'ALUNO' | 'PROFESSOR') {
    this.erroLogin = false;
    this.erroMensagem = '';
    this.loginForm.patchValue({ perfil });
    this.cdr.detectChanges();
  }

  get cadastrandoNovaEscola(): boolean {
    return this.solicitacaoForm.get('escolaSelecionada')?.value === '__NOVA_ESCOLA__';
  }

  async entrarComoAluno() {
    this.erroLogin = false;
    this.erroMensagem = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.erroLogin = true;
      this.erroMensagem = 'Preencha seu nome completo e confirme sua escola, série e turma.';
      this.cdr.detectChanges();
      return;
    }

    try {
      this.carregando = true;
      this.cdr.detectChanges();

      await this.supabaseService.limparSessaoCompleta();

      const { nome, escola, serie, turma } = this.loginForm.value;
      this.supabaseService.salvarSessaoAluno({
        nome: nome.trim(),
        escola,
        serie,
        turma,
      });

      this.router.navigate(['/glossario']);
    } catch (error) {
      console.error('Falha ao salvar identificação do aluno:', error);
      this.erroLogin = true;
      this.erroMensagem = 'Não foi possível salvar seus dados. Tente novamente.';
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  async entrarComGoogle() {
    try {
      this.carregando = true;
      this.erroLogin = false;
      this.erroMensagem = '';
      this.cdr.detectChanges();

      await this.supabaseService.loginComGoogle();
    } catch (error) {
      console.error('Falha ao iniciar login OAuth com Google:', error);
      this.erroLogin = true;
      this.erroMensagem = 'Não foi possível conectar ao Google. Tente novamente.';
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  async enviarSolicitacaoProfessor() {
    this.feedbackSolicitacao = null;
    const { nome, email, escolaSelecionada, novaEscolaNome, novaEscolaCidade } =
      this.solicitacaoForm.value;

    const nomeValido = nome && nome.trim().length >= 3;
    const emailValido = this.solicitacaoForm.get('email')?.valid;
    const novaEscolaValida =
      !this.cadastrandoNovaEscola ||
      (novaEscolaNome?.trim().length >= 3 && novaEscolaCidade?.trim().length >= 2);

    if (!nomeValido || !emailValido || !novaEscolaValida) {
      this.solicitacaoForm.markAllAsTouched();
      this.feedbackSolicitacao = {
        tipo: 'erro',
        texto: this.cadastrandoNovaEscola
          ? 'Preencha seu nome, e-mail válido, o nome da nova escola e a cidade/RA.'
          : 'Preencha seu nome, um e-mail Google válido e selecione a escola.',
      };
      this.cdr.detectChanges();
      return;
    }

    this.enviandoSolicitacao = true;
    this.cdr.detectChanges();

    try {
      const resultado = await this.supabaseService.solicitarAcessoProfessor({
        nome: nome.trim(),
        email: email.trim(),
        escolaExistente: this.cadastrandoNovaEscola ? undefined : escolaSelecionada,
        novaEscolaNome: this.cadastrandoNovaEscola ? novaEscolaNome.trim() : undefined,
        novaEscolaCidade: this.cadastrandoNovaEscola ? novaEscolaCidade.trim() : undefined,
      });

      if (resultado === 'CRIADO_COM_ESCOLA') {
        this.feedbackSolicitacao = {
          tipo: 'sucesso',
          texto:
            'Solicitação enviada! Tanto a nova escola quanto o seu e-mail foram encaminhados para aprovação da CloudToCode.',
        };
        this.solicitacaoForm.reset({ escolaSelecionada: this.escolas[0] ?? '' });
      } else if (resultado === 'CRIADO') {
        this.feedbackSolicitacao = {
          tipo: 'sucesso',
          texto:
            'Solicitação registrada com sucesso! A CloudToCode avaliará seu cadastro e liberará seu acesso em breve.',
        };
        this.solicitacaoForm.reset({ escolaSelecionada: this.escolas[0] ?? '' });
      } else if (resultado === 'JA_PENDENTE') {
        this.feedbackSolicitacao = {
          tipo: 'info',
          texto: 'Este e-mail já possui uma solicitação pendente em análise pela CloudToCode.',
        };
      } else if (resultado === 'JA_APROVADO') {
        this.feedbackSolicitacao = {
          tipo: 'sucesso',
          texto:
            'Este e-mail já está aprovado! Você já pode clicar em "Entrar com o Google" acima.',
        };
      }
    } catch (error) {
      this.feedbackSolicitacao = {
        tipo: 'erro',
        texto: 'Não foi possível registrar sua solicitação no momento. Tente novamente.',
      };
    } finally {
      this.enviandoSolicitacao = false;
      this.cdr.detectChanges();
    }
  }
}
