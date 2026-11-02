import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../supabase.service';

// Tela pública responsável apenas por iniciar e validar o fluxo OAuth.
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  carregando = false;
  erroLogin = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // Redireciona sessões já existentes para o conteúdo protegido.
  async ngOnInit() {
    const session = await this.supabaseService.obterSessao();
    if (session) {
      this.router.navigate(['/']);
    }
  }

  // Inicia o login Google e expõe falhas sem alterar o estado de autenticação.
  async entrarComGoogle() {
    try {
      this.carregando = true;
      this.erroLogin = false;
      await this.supabaseService.loginComGoogle();
    } catch (error) {
      console.error("Falha ao iniciar login OAuth com Google:", error);
      this.erroLogin = true;
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }
}