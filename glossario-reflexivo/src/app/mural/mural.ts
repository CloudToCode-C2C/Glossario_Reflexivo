import { Component, OnInit, computed, input, signal } from '@angular/core';
import { CardGiriaComponent } from '../card-giria/card-giria';
import { SupabaseService } from '../supabase.service';

export interface Verbete {
  id: string;
  expressao: string;
  significado: string;
  contexto: string;
  data_criacao: Date;
}

@Component({
  selector: 'app-mural',
  standalone: true,
  imports: [CardGiriaComponent],
  templateUrl: './mural.html',
  styleUrls: ['./mural.scss'],
})
export class MuralComponent implements OnInit {
  readonly categoriaFiltro = input('');

  readonly verbetes = signal<Verbete[]>([]);
  readonly carregando = signal(true);
  readonly verbetesFiltrados = computed(() => {
    const categoriaFiltro = this.categoriaFiltro();
    const verbetes = this.verbetes();

    if (!categoriaFiltro) return verbetes;
    return verbetes.filter(
      verbete => verbete.contexto === categoriaFiltro
    );
  });
  
  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.carregarDados();
  }

  async carregarDados() {
    console.log('1. Iniciando requisição ao Supabase...');
    this.carregando.set(true);
    
    try {
      const data = await this.supabaseService.buscarVerbetes();
      console.log('2. Dados recebidos do Supabase:', data); // Se travar antes daqui, o problema é na rede/serviço
      
      this.verbetes.set((data ?? []) as Verbete[]);
    } catch (error) {
      console.error('3. Erro capturado no catch:', error);
    } finally {
      console.log('4. Executando o bloco finally. Desligando o spinner.');
      this.carregando.set(false);
    }
  }
}