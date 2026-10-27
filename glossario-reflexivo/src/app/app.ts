import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { BottomNavComponent } from './bottom-nav/bottom-nav';
import { SupabaseService } from './supabase.service';
import { FormularioComponent } from './formulario/formulario';
import { MuralComponent } from './mural/mural';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent, FormularioComponent, MuralComponent],
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
    // 1. Verifica o estado inicial ao abrir o app
    this.usuarioLogado = await this.supabaseService.obterUsuarioAtual();
    this.cdr.detectChanges();

    // 2. Escuta login, logout ou expiração de token em tempo real
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