import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { SupabaseService } from '../supabase.service';

// Widget de contribuição que associa o verbete à categoria e ao usuário atual.
@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './formulario.html',
  styleUrls: ['./formulario.scss']
})
export class FormularioComponent implements OnInit {
  @Input() categoriaAtual!: string;
  mensagemSucesso = false;
  estaAEnviar = false;
  usuario: any = null;
  sessaoAluno: any = null;

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  verbeteForm = new FormGroup({
    expressao: new FormControl('', [Validators.required]),
    significado: new FormControl('', [Validators.required])
  });

  // Carrega o usuário para preencher a autoria no momento do envio.
  async ngOnInit() {
    // Tenta pegar o professor logado via OAuth
    this.usuario = await this.supabaseService.obterUsuarioAtual();
    // Tenta pegar o aluno no LocalStorage
    this.sessaoAluno = this.supabaseService.obterSessaoAluno();
    this.cdr.detectChanges();
  }

  // Envia o verbete para o Supabase, associando-o à categoria e ao usuário atual.
  async onSubmit() {
    if (!this.categoriaAtual) {
      alert("Erro interno: Categoria da expressão não definida.");
      return;
    }

    if (this.verbeteForm.invalid) {
      this.verbeteForm.markAllAsTouched();
      return;
    }

    // Valida se há ALGUMA sessão ativa (Aluno ou Professor)
    if (!this.usuario && !this.sessaoAluno) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    this.estaAEnviar = true;
    this.cdr.detectChanges();

    const novoVerbete = {
      expressao: this.verbeteForm.value.expressao,
      significado: this.verbeteForm.value.significado,
      contexto: this.categoriaAtual,
      status_aprovado: false, // Entra pendente para todos
      
      // Se for aluno, grava os metadados. Se for professor, grava o email.
      autor_nome: this.sessaoAluno?.nome || null,
      autor_email: this.usuario?.email || null,
      escola: this.sessaoAluno?.escola || null,
      serie: this.sessaoAluno?.serie || null,
      turma: this.sessaoAluno?.turma || null
    };

    try {
      await this.supabaseService.inserirVerbete(novoVerbete);
      this.verbeteForm.reset();
      this.mensagemSucesso = true;
      setTimeout(() => this.mensagemSucesso = false, 3500);
    } catch (error) {
      console.error('Erro ao enviar:', error);
      alert("Ocorreu um erro ao enviar. Tente novamente.");
    } finally {
      this.estaAEnviar = false;
      this.cdr.detectChanges();
    }
  }
}