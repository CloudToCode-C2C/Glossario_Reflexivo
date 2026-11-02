import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { BottomNavComponent } from './bottom-nav/bottom-nav';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('glossario-reflexivo');
  usuarioLogado: any = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Sincroniza a aplicação com a sessão existente antes de renderizar a navegação.
    this.usuarioLogado = await this.supabaseService.obterUsuarioAtual();
    this.cdr.detectChanges();

    // Mantém a interface atualizada quando o Supabase altera o estado da autenticação.
    this.supabaseService.escutarMudancasAuth((event, session) => {
      this.usuarioLogado = session?.user ?? null;
      this.cdr.detectChanges();

      if (event === 'SIGNED_OUT') {
        this.router.navigate(['/login']);
      }
    });
  }

  async sair() {
    await this.supabaseService.fazerLogout();
  }
}