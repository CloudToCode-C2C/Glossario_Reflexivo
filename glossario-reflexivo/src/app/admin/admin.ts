import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../supabase.service';

type TabelaAdmin = 'verbetes_colaborativos' | 'relatos' | 'respostas_reflexao';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent implements OnInit, OnDestroy {
  abaAtiva: TabelaAdmin = 'verbetes_colaborativos';
  registros: any[] = [];
  carregando = true;
  erroMensagem = '';

  private filtroSub?: Subscription;

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Recarrega a lista sempre que o professor altera a Escola/Série/Turma no cabeçalho
    this.filtroSub = this.supabaseService.filtroProfessor$.subscribe(() => {
      void this.carregarRegistros();
    });
  }

  ngOnDestroy(): void {
    this.filtroSub?.unsubscribe();
  }

  selecionarAba(aba: TabelaAdmin): void {
    this.abaAtiva = aba;
    void this.carregarRegistros();
  }

  async carregarRegistros(): Promise<void> {
    this.carregando = true;
    this.erroMensagem = '';
    this.cdr.detectChanges();

    try {
      this.registros = await this.supabaseService.listarRegistrosAdmin(this.abaAtiva);
    } catch (error) {
      console.error('Erro ao carregar registos na moderação:', error);
      this.erroMensagem = 'Não foi possível carregar os registos para moderação.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  async alternarStatus(item: any): Promise<void> {
    const novoStatus = !item.status_aprovado;
    try {
      await this.supabaseService.atualizarStatusAprovacao(this.abaAtiva, item.id, novoStatus);
      item.status_aprovado = novoStatus;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Falha ao atualizar o status da contribuição.');
    }
  }

  async excluir(id: string | number): Promise<void> {
    if (!confirm('Deseja eliminar permanentemente esta contribuição?')) return;

    try {
      await this.supabaseService.excluirRegistroAdmin(this.abaAtiva, id);
      this.registros = this.registros.filter(r => r.id !== id);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao eliminar registo:', error);
      alert('Falha ao eliminar o registo.');
    }
  }
}