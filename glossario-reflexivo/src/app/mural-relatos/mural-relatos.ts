import { DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { SupabaseService } from '../supabase.service';

interface Relato {
  id: string | number;
  texto: string;
  created_at: string;
}

// Fórum de relatos: combina formulário de envio, moderação e feed comunitário.
@Component({
  selector: 'app-mural-relatos',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './mural-relatos.html',
  styleUrls: ['./mural-relatos.scss']
})
export class MuralRelatosComponent implements OnInit {
  relatos: Relato[] = [];
  usuarioAtual: { email?: string | null } | null = null;
  estaAEnviar = false;
  estaCarregando = true;
  erroAoCarregar = false;

  relatoForm = new FormGroup({
    texto: new FormControl('', [Validators.required, Validators.minLength(10)])
  });

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  // Obtém a autoria atual e carrega os relatos aprovados pelo serviço.
  async ngOnInit() {
    this.usuarioAtual = await this.supabaseService.obterUsuarioAtual();
    await this.carregarRelatos();
  }

  // Recarrega o feed e diferencia estado de carregamento de estado de erro.
  async carregarRelatos() {
    this.estaCarregando = true;
    this.erroAoCarregar = false;

    try {
      this.relatos = await this.supabaseService.buscarRelatos();
    } catch (error) {
      console.error('Erro ao carregar relatos:', error);
      this.erroAoCarregar = true;
    } finally {
      this.estaCarregando = false;
      this.cdr.detectChanges();
    }
  }

  // Envia o relato como pendente, sem inseri-lo diretamente no feed local.
  async onSubmit() {
    if (this.relatoForm.invalid || !this.usuarioAtual?.email) {
      this.relatoForm.markAllAsTouched();
      return;
    }

    this.estaAEnviar = true;
    this.cdr.detectChanges();

    const novoRelato = {
      texto: this.relatoForm.value.texto,
      autor_email: this.usuarioAtual.email,
      status_aprovado: false
    };

    try {
      await this.supabaseService.inserirRelato(novoRelato);
      this.relatoForm.reset();
      alert("Relato enviado para aprovação! Obrigado por compartilhar sua experiência.");
    } catch (error) {
      console.error("Erro ao enviar relato:", error);
      alert("Ocorreu um erro ao enviar o relato. Por favor, tente novamente mais tarde.");
    } finally {
      this.estaAEnviar = false;
      this.cdr.detectChanges();
    }
  }
}