import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  SupabaseService,
  SERIES_PERMITIDAS,
  TURMAS_PERMITIDAS,
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
  profLoginForm: FormGroup;
  solicitacaoForm: FormGroup;

  escolas: string[] = [];
  series = SERIES_PERMITIDAS;
  turmas = TURMAS_PERMITIDAS;

  carregando = false;
  verificandoSessao = true;
  erroLogin = false;
  erroMensagem = '';
  emailNaoConfirmado = false;
  mostrarAcaoConfirmacao = false;
  reenviandoConfirmacao = false;
  mensagemConfirmacao = '';
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
      escola: ['', Validators.required],
      serie: [this.series[0], Validators.required],
      turma: [this.turmas[0], Validators.required],
    });

    // Acesso do professor com e-mail e senha.
    this.profLoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Cadastro e pedido de autorização para novos professores.
    this.solicitacaoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      escolaSelecionada: ['', Validators.required],
      novaEscolaNome: [''],
      novaEscolaCidade: [''],
    });
  }

  async ngOnInit() {
    // Atualiza as opções de escola dos dois formulários quando a lista é carregada.
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

      const session = await this.supabaseService.obterSessao();
      if (session) {
        const autorizado = await this.supabaseService.verificarProfessorAutorizado();
        if (autorizado) {
          this.router.navigate(['/glossario']);
          return;
        } else {
          await this.supabaseService.limparSessaoCompleta();
          this.loginForm.patchValue({ perfil: 'PROFESSOR' });
          this.erroLogin = true;
          this.erroMensagem =
            'Acesso pendente: seu e-mail ainda aguarda aprovação da equipe CloudToCode.';
        }
      } else {
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

  selecionarPerfil(perfil: 'ALUNO' | 'PROFESSOR') {
    this.erroLogin = false;
    this.erroMensagem = '';
    this.emailNaoConfirmado = false;
    this.mostrarAcaoConfirmacao = false;
    this.mensagemConfirmacao = '';
    this.feedbackSolicitacao = null;
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

  // Confere as credenciais e só mantém a sessão se o professor já estiver autorizado.
  async entrarComEmailProfessor() {
    this.erroLogin = false;
    this.erroMensagem = '';
    this.emailNaoConfirmado = false;
    this.mostrarAcaoConfirmacao = false;
    this.mensagemConfirmacao = '';

    if (this.profLoginForm.invalid) {
      this.profLoginForm.markAllAsTouched();
      this.erroLogin = true;
      this.erroMensagem = 'Informe seu e-mail institucional e sua senha (mínimo 6 caracteres).';
      this.cdr.detectChanges();
      return;
    }

    try {
      this.carregando = true;
      this.cdr.detectChanges();

      const { email, senha } = this.profLoginForm.value;
      await this.supabaseService.loginComEmailSenha(email, senha);

      // Uma conta válida ainda precisa estar aprovada para acessar as áreas protegidas.
      const autorizado = await this.supabaseService.verificarProfessorAutorizado();
      if (autorizado) {
        this.router.navigate(['/glossario']);
      } else {
        await this.supabaseService.limparSessaoCompleta();
        this.erroLogin = true;
        this.erroMensagem =
          'Acesso negado: seu cadastro ainda está em análise ou não foi autorizado pela CloudToCode.';
      }
    } catch (error: any) {
      console.error('Falha no login por e-mail/senha:', error);
      this.erroLogin = true;
      this.emailNaoConfirmado = this.supabaseService.isEmailConfirmationError(error);
      this.mostrarAcaoConfirmacao = true;
      this.erroMensagem = this.emailNaoConfirmado
        ? 'Seu e-mail ainda não foi confirmado. Abra a mensagem enviada pelo Supabase e clique no link de confirmação antes de entrar.'
        : 'Não foi possível entrar. Se este é seu primeiro acesso, confirme o e-mail enviado pelo Supabase e tente novamente. Caso já tenha confirmado, confira o e-mail e a senha digitados.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  async reenviarConfirmacaoEmail() {
    // O reenvio só é possível com um endereço válido no campo de login do professor.
    const email = this.profLoginForm.get('email')?.value?.trim();
    if (!email || this.profLoginForm.get('email')?.invalid) {
      this.mensagemConfirmacao = 'Informe um e-mail válido acima para reenviar a confirmação.';
      return;
    }

    try {
      this.reenviandoConfirmacao = true;
      this.mensagemConfirmacao = '';
      await this.supabaseService.reenviarConfirmacaoEmail(email);
      this.mensagemConfirmacao =
        'Novo e-mail de confirmação enviado. Verifique também a caixa de spam e clique no link recebido.';
    } catch (error) {
      console.error('Falha ao reenviar confirmação de e-mail:', error);
      this.mensagemConfirmacao =
        'Não foi possível reenviar agora. Confira o endereço e tente novamente em alguns instantes.';
    } finally {
      this.reenviandoConfirmacao = false;
      this.cdr.detectChanges();
    }
  }

  async entrarComGoogle() {
    // O Supabase redireciona de volta ao app depois da autenticação do Google.
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
    // Valida os dados antes de criar a conta e encaminhar o pedido à equipe responsável.
    this.feedbackSolicitacao = null;
    this.erroLogin = false;
    this.erroMensagem = '';

    const { nome, email, senha, escolaSelecionada, novaEscolaNome, novaEscolaCidade } =
      this.solicitacaoForm.value;

    const nomeValido = nome && nome.trim().length >= 3;
    const emailValido = this.solicitacaoForm.get('email')?.valid;
    const senhaValida = senha && senha.length >= 6;
    const novaEscolaValida =
      !this.cadastrandoNovaEscola ||
      (novaEscolaNome?.trim().length >= 3 && novaEscolaCidade?.trim().length >= 2);

    if (!nomeValido || !emailValido || !senhaValida || !novaEscolaValida) {
      this.solicitacaoForm.markAllAsTouched();
      this.feedbackSolicitacao = {
        tipo: 'erro',
        texto:
          'Preencha seu nome, e-mail válido, crie uma senha de no mínimo 6 caracteres e informe a escola.',
      };
      this.cdr.detectChanges();
      return;
    }

    this.enviandoSolicitacao = true;
    this.cdr.detectChanges();

    try {
      const emailLimpo = email.trim().toLowerCase();

      // Cria a credencial antes de registrar a solicitação de acesso.
      await this.supabaseService.criarCredencialAuthProfessor(emailLimpo, senha);

      // Registra os dados do professor e, se necessário, a nova escola informada.
      await this.supabaseService.solicitarAcessoProfessor({
        nome: nome.trim(),
        email: emailLimpo,
        escolaExistente: this.cadastrandoNovaEscola ? undefined : escolaSelecionada,
        novaEscolaNome: this.cadastrandoNovaEscola ? novaEscolaNome.trim() : undefined,
        novaEscolaCidade: this.cadastrandoNovaEscola ? novaEscolaCidade.trim() : undefined,
      });

      if (this.cadastrandoNovaEscola) {
        await this.supabaseService.carregarEscolasAprovadas();
      }

      // Após registrar o pedido, inicia a sessão e abre o glossário.
      await this.supabaseService.loginComEmailSenha(emailLimpo, senha);
      await this.router.navigate(['/glossario']);
    } catch (error: any) {
      console.error('Detalhe do erro no cadastro/login do professor:', error);
      this.feedbackSolicitacao = {
        tipo: 'erro',
        texto: error?.message || 'Não foi possível concluir o acesso. Tente novamente.',
      };
    } finally {
      this.enviandoSolicitacao = false;
      this.cdr.detectChanges();
    }
  }
}