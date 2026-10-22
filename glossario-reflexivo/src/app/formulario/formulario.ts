import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './formulario.html',
  styleUrls: ['./formulario.scss']
})
export class FormularioComponent {
  @Input() categoriaAtual!: string;
  mensagemSucesso = false;
  estaAEnviar = false;

  constructor(private supabaseService: SupabaseService) {}

  verbeteForm =new FormGroup({
    expressao: new FormControl('', [Validators.required]),
    significado: new FormControl('', [Validators.required])
  });

  async onSubmit() {
    if (!this.categoriaAtual) {
      console.error("Erro de Integração: O componente pai não enviou a categoria atual.");
      alert("Erro interno: Categoria da expressão não definida.");
      return;
    }

    if (this.verbeteForm.valid) {
      this.estaAEnviar = true;
      const novoVerbete = {
        expressao: this.verbeteForm.value.expressao,
        significado: this.verbeteForm.value.significado,
        contexto: this.categoriaAtual,
        status_aprovado: false
      };

    try {
      await this.supabaseService.inserirVerbete(novoVerbete);

      this.verbeteForm.reset();
      this.mensagemSucesso = true;
      setTimeout(() => this.mensagemSucesso = false, 3500);
    } catch (error) {
      console.error('Erro ao enviar para a base de dados: ', error);
      alert("Ocorreu um erro ao enviar. Tente novamente.");
    } finally {
      this.estaAEnviar = false;
    }
    } else {
      this.verbeteForm.markAllAsTouched();
    }
  }
}