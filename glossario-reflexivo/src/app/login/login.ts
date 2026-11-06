import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  SupabaseService,
  ESCOLAS_PERMITIDAS,
  SERIES_PERMITIDAS,
  TURMAS_PERMITIDAS,
  EMAIL_SUPORTE_C2C
} from '../supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  escolas = ESCOLAS_PERMITIDAS;
  series = SERIES_PERMITIDAS;
  turmas = TURMAS_PERMITIDAS;

  carregando = false;
  verificandoSessao = true;
  erroLogin = false;
  erroMensagem = '';

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      perfil: ['ALUNO', Validators.required],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      escola: [this.escolas[0], Validators.required],
      serie: [this.series[0], Validators.required],
      turma: [this.turmas[0], Validators.required]
    });
  }

  async ngOnInit() {
    try {
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
          this.erroMensagem = 'Acesso negado: seu e-mail não consta na lista de professores autorizados pela CloudToCode.';
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
      'Olá equipe CloudToCode,\n\nSolicito a liberação do meu e-mail institucional na lista de professores autorizados.\n\nNome Completo:\nInstituição de Ensino:\nE-mail Google:'
    );
    return `mailto:${EMAIL_SUPORTE_C2C}?subject=${assunto}&body=${corpo}`;
  }

  selecionarPerfil(perfil: 'ALUNO' | 'PROFESSOR') {
    this.erroLogin = false;
    this.erroMensagem = '';
    this.loginForm.patchValue({ perfil });
    this.cdr.detectChanges();
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
        turma
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
}