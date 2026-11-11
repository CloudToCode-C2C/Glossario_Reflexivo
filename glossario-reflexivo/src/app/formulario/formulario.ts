import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { SupabaseService } from '../supabase.service';

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

  async ngOnInit() {
    // Recupera a sessão do professor.
    this.usuario = await this.supabaseService.obterUsuarioAtual();
    // Recupera a sessão do aluno, se houver.
    this.sessaoAluno = this.supabaseService.obterSessaoAluno();
    this.cdr.detectChanges();
  }

  async onSubmit() {
    if (!this.categoriaAtual) {
      console.error("Erro de Integração: O componente pai não enviou a categoria atual.");
      alert("Erro interno: Categoria da expressão não definida.");
      return;
    }

    if (this.verbeteForm.invalid) {
      this.verbeteForm.markAllAsTouched();
      return;
    }

    // Exige uma sessão de aluno ou professor.
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
      status_aprovado: false,
      autor_nome: this.sessaoAluno?.nome || null,
      autor_email: this.usuario?.email || null,
      escola: this.sessaoAluno?.escola || null,
      serie: this.sessaoAluno?.serie || null,
      turma: this.sessaoAluno?.turma || null
    };

    try {
      await this.supabaseService.inserirVerbete(novoVerbete);

      // Limpa o formulário e mostra a confirmação.
      this.verbeteForm.reset();
      this.mensagemSucesso = true;
      setTimeout(() => this.recomecarFormulario(), 3500);

    } catch (error) {
      console.error('Erro ao enviar para a base de dados: ', error);
      alert("Ocorreu um erro ao enviar. Tente novamente.");
    } finally {
      this.estaAEnviar = false;
      this.cdr.detectChanges();
    }
  }

  // Fecha a confirmação e permite um novo envio.
  recomecarFormulario() {
    this.mensagemSucesso = false;
  }
}