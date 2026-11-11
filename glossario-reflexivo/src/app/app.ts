import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BottomNavComponent } from './bottom-nav/bottom-nav';
import { SwUpdate } from '@angular/service-worker';
import {
  SupabaseService,
  SessaoAluno,
  FiltroProfessor,
  SERIES_PERMITIDAS,
  TURMAS_PERMITIDAS,
} from './supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BottomNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('glossario-reflexivo');
  usuarioLogado: any = null;
  sessaoAluno: SessaoAluno | null = null;
  ehProfessorAutorizado = false;

  escolas: string[] = [];
  series = SERIES_PERMITIDAS;
  turmas = TURMAS_PERMITIDAS;
  filtroAtual: FiltroProfessor = { escola: 'TODAS', serie: 'TODAS', turma: 'TODAS' };

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private swUpdate: SwUpdate
  ) {}

  get possuiSessaoAtiva(): boolean {
    return !!(this.ehProfessorAutorizado || this.sessaoAluno);
  }

  get identificacaoExibicao(): string {
    if (this.sessaoAluno) {
      return `${this.sessaoAluno.nome} • ${this.sessaoAluno.escola} • ${this.sessaoAluno.serie} ${this.sessaoAluno.turma}`;
    }
    return this.usuarioLogado?.email ?? '';
  }

  async ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(evt => {
        if (evt.type === 'VERSION_READY') {
          window.location.reload();
        }
      });
    }
    
    this.filtroAtual = this.supabaseService.obterFiltroProfessorAtual();

    this.supabaseService.escolasPermitidas$.subscribe((escolas) => {
      this.escolas = escolas;

      const escolaSelecionada = this.supabaseService.obterFiltroProfessorAtual().escola;
      if (escolaSelecionada !== 'TODAS' && !escolas.includes(escolaSelecionada)) {
        this.supabaseService.atualizarFiltroProfessor({ escola: 'TODAS' });
      }

      this.cdr.detectChanges();
    });

    // Carrega a lista também em sessões restauradas pelo OAuth ou pelo PWA.
    await this.supabaseService.carregarEscolasAprovadas();
    await this.sincronizarEstadoAuth();

    this.supabaseService.sessaoAluno$.subscribe((aluno) => {
      this.sessaoAluno = aluno;
      if (aluno) {
        this.ehProfessorAutorizado = false;
      }
      this.cdr.detectChanges();
    });

    this.supabaseService.filtroProfessor$.subscribe((filtro) => {
      this.filtroAtual = filtro;
      this.cdr.detectChanges();
    });

    this.supabaseService.escutarMudancasAuth(async (event, session) => {
      this.usuarioLogado = session?.user ?? null;
      this.ehProfessorAutorizado = this.usuarioLogado
        ? await this.supabaseService.verificarProfessorAutorizado()
        : false;
      this.cdr.detectChanges();

      if (event === 'SIGNED_OUT' && !this.sessaoAluno) {
        this.router.navigate(['/login']);
      }
    });
  }

  private async sincronizarEstadoAuth() {
    this.sessaoAluno = this.supabaseService.obterSessaoAluno();
    this.usuarioLogado = await this.supabaseService.obterUsuarioAtual();
    this.ehProfessorAutorizado = this.usuarioLogado
      ? await this.supabaseService.verificarProfessorAutorizado()
      : false;
    this.cdr.detectChanges();
  }

  alterarFiltro(campo: keyof FiltroProfessor, event: Event) {
    const valor = (event.target as HTMLSelectElement).value;
    this.supabaseService.atualizarFiltroProfessor({ [campo]: valor });
  }

  async sair() {
    await this.supabaseService.fazerLogout();
    this.usuarioLogado = null;
    this.sessaoAluno = null;
    this.ehProfessorAutorizado = false;
    this.cdr.detectChanges();
    this.router.navigate(['/login']);
  }
}
