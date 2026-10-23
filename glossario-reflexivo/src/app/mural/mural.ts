import { Component, Input, OnInit } from '@angular/core';
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
  @Input() categoriaFiltro!: string;

  verbetes: Verbete[] = [];
  carregando = true;
  
  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.carregarDados();
  }

  async carregarDados() {
    try {
      this.carregando = true;
      const data = await this.supabaseService.buscarVerbetes();
      this.verbetes = data as Verbete[];
    } catch (error) {
      console.error("Erro ao buscar dados do Supabase: ", error);
    } finally {
      this.carregando = false;
    }
  }

  get verbetesFiltrados(): Verbete[] {
    if (!this.categoriaFiltro) return this.verbetes;
    return this.verbetes.filter(
      verbete => verbete.contexto === this.categoriaFiltro
    );
  }
}