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
  styleUrls: ['./mural-relatos.scss'],
})
export class MuralRelatosComponent implements OnInit {
  relatos: Relato[] = [];
  usuarioAtual: { email?: string | null } | null = null;
  estaAEnviar = false;
  estaCarregando = true;
  erroAoCarregar = false;
  mensagemSucesso = false;
  sessaoAluno: any = null;

  relatoForm = new FormGroup({
    texto: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
  ) {}

  // Obtém a autoria atual e carrega os relatos aprovados pelo serviço.
  async ngOnInit() {
    this.usuarioAtual = await this.supabaseService.obterUsuarioAtual();
    this.sessaoAluno = this.supabaseService.obterSessaoAluno();

    // Agora o mural escuta as mudanças no filtro do professor também
    this.supabaseService.filtroProfessor$.subscribe(() => {
      this.carregarRelatos();
    });
  }

  async onSubmit() {
    if (this.relatoForm.invalid) {
      this.relatoForm.markAllAsTouched();
      return;
    }

    if (!this.usuarioAtual && !this.sessaoAluno) {
      alert('Sessão expirada. Faça login novamente.');
      return;
    }

    this.estaAEnviar = true;
    this.cdr.detectChanges();

    const novoRelato = {
      texto: this.relatoForm.value.texto,
      status_aprovado: false,
      autor_nome: this.sessaoAluno?.nome || null,
      autor_email: this.usuarioAtual?.email || null,
      escola: this.sessaoAluno?.escola || null,
      serie: this.sessaoAluno?.serie || null,
      turma: this.sessaoAluno?.turma || null,
    };

    try {
      await this.supabaseService.inserirRelato(novoRelato);
      this.relatoForm.reset();
      this.mensagemSucesso = true;
      setTimeout(() => (this.mensagemSucesso = false), 3500);
    } catch (error) {
      console.error('Erro ao enviar relato:', error);
      alert('Ocorreu um erro ao enviar o relato.');
    } finally {
      this.estaAEnviar = false;
      this.cdr.detectChanges();
    }
  }

  async carregarRelatos() {
    this.estaCarregando = true;
    this.erroAoCarregar = false;
    this.cdr.detectChanges();

    try {
      this.relatos = await this.supabaseService.buscarRelatos();
    } catch (error) {
      console.error('Erro ao carregar relatos:', error);
      this.erroAoCarregar = true;
      this.relatos = [];
    } finally {
      this.estaCarregando = false;
      this.cdr.detectChanges();
    }
  }
}
