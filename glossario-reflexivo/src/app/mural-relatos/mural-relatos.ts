import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

export interface Relato {
  id: number;
  texto_relato: string;
  data_criacao: Date;
}

@Component({
  selector: 'app-mural-relatos',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './mural-relatos.html',
  styleUrls: ['./mural-relatos.scss']
})
export class MuralRelatosComponent {
  relatoForm = new FormGroup({
    texto_relato: new FormControl('', [Validators.required, Validators.minLength(10)])
  });

  relatosMock: Relato[] = [
    {
      id: 1,
      texto_relato: 'Achei muito importante aprender sobre o capacitismo. Nunca tinha percebido como o uso de algumas palavras machuca outras pessoas.',
      data_criacao: new Date('2026-10-20T14:20:00')
    },
    {
      id: 2,
      texto_relato: 'Uma vez zombaram do meu sotaque quando cheguei na escola nova. Foi muito ruim, mas a professora explicou sobre variação linguística e ajudou muito.',
      data_criacao: new Date('2026-10-18T10:30:00')
    }
  ];

  onSubmit() {
    if (this.relatoForm.valid) {
      const novoRelato: Relato = {
        id: Date.now(),
        texto_relato: this.relatoForm.value.texto_relato!,
        data_criacao: new Date()
      };

      // Truque para adicionar o novo relato no início do array, mantendo a ordem dos relatos mais recentes no topo.
      this.relatosMock.unshift(novoRelato);

      this.relatoForm.reset();
    }
  }
}