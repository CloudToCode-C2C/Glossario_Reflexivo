import { Component, OnDestroy, OnInit, computed, input, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { CardGiriaComponent, DadosGiria } from '../card-giria/card-giria';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-mural',
  standalone: true,
  imports: [CardGiriaComponent],
  templateUrl: './mural.html',
  styleUrls: ['./mural.scss'],
})
export class MuralComponent implements OnInit, OnDestroy {
  readonly categoriaFiltro = input('');

  readonly verbetes = signal<DadosGiria[]>([]);
  readonly carregando = signal(true);
  readonly verbetesFiltrados = computed(() => {
    const categoriaFiltro = this.categoriaFiltro();
    const verbetes = this.verbetes();

    if (!categoriaFiltro) return verbetes;
    return verbetes.filter(verbete => verbete.contexto === categoriaFiltro);
  });

  private filtroSub?: Subscription;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    // O BehaviorSubject dispara imediatamente na entrada e sempre que o professor muda o filtro
    this.filtroSub = this.supabaseService.filtroProfessor$.subscribe(() => {
      void this.carregarDados();
    });
  }

  ngOnDestroy(): void {
    this.filtroSub?.unsubscribe();
  }

  async carregarDados(): Promise<void> {
    this.carregando.set(true);

    try {
      const data = await this.supabaseService.buscarVerbetes();
      this.verbetes.set((data ?? []) as DadosGiria[]);
    } catch (error) {
      console.error('Erro ao carregar verbetes no mural:', error);
    } finally {
      this.carregando.set(false);
    }
  }
}