import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../supabase.service';

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

  async ngOnInit() {
    const session = await this.supabaseService.obterSessao();
    if (session) {
      this.router.navigate(['/']);
    }
  }

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