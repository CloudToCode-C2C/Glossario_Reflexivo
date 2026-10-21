import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './formulario.html',
  styleUrls: ['./formulario.scss'],
})
export class FormularioComponent {
  @Input() categoriaAtual!: string;

  verbeteForm = new FormGroup({
    expressao: new FormControl('', [Validators.required]),
    significado: new FormControl('', [Validators.required]),
  });

  mensagemSucesso = false;

  onSubmit() {
    if (this.verbeteForm.valid) {
      const novoVerbete = {
        ...this.verbeteForm.value,
        categoria: this.categoriaAtual,
        status_aprovado: false, // Vou fazer uma moderação simples aqui
        data_criacao: new Date(),
      };

      console.log('Pronto para enviar ao Supabase:', novoVerbete);

      this.verbeteForm.reset();
      this.mensagemSucesso = true;

      // Sumindo com a mensagem de sucesso após 3.5 segundos
      setTimeout(() => {
        this.mensagemSucesso = false;
      }, 3500);
    } else {
      this.verbeteForm.markAllAsTouched(); // Funciona para mostrar os erros de validação se o formulário não for válido.
    }
  }
}
