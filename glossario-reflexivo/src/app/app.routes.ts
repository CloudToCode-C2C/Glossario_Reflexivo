import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { adminGuard, authGuard } from './auth-guard';
import { GlossarioComponent } from './glossario/glossario';
import { MuralRelatosComponent } from './mural-relatos/mural-relatos';
import { ReflexaoSalaComponent } from './reflexao-sala/reflexao-sala';
import { AdminComponent } from './admin/admin';
import { SobreComponent } from './sobre/sobre';

export const routes: Routes = [
  // 1. ROTA PÚBLICA (Acesso livre)
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.LoginComponent),
  },
  
  // 2. ÁREA RESTRITA (Exige Login)
  {
    path: '',
    canActivate: [authGuard],
    children: [
      // 2.1 A nova página inicial é o Glossário
      {
        path: '',
        loadComponent: () => import('./glossario/glossario').then(m => m.GlossarioComponent),
      },
      // Suporte para o filtro de categoria criado pelo Arthur
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./admin/admin').then(m => m.AdminComponent),
      },
      {
        path: 'glossario/:categoria',
        loadComponent: () => import('./glossario/glossario').then(m => m.GlossarioComponent),
      },
      {
        path: 'glossario',
        redirectTo: '',
        pathMatch: 'full',
      },

      // 2.2 A aba Fórum/Mural
      {
        path: 'forum',
        loadComponent: () => import('./mural-relatos/mural-relatos').then(m => m.MuralRelatosComponent),
      },
      {
        path: 'mural',
        redirectTo: 'forum',
        pathMatch: 'full',
      },

      // 2.3 A aba Sobre 
      // Se ele já tinha um SobreComponent, vamos usá-lo. 
      // Se quiser usar a antiga Home como Sobre, é só trocar o component.
      {
        path: 'sobre',
        loadComponent: () => import('./sobre/sobre').then(m => m.SobreComponent), 
      },
      // Redireciona a antiga rota 'home' para o sobre
      {
        path: 'home',
        redirectTo: 'sobre',
      },

      // 2.4 Rotas adicionais do projeto do Arthur
      {
        path: 'reflexao/:id',
        loadComponent: () => import('./reflexao-sala/reflexao-sala').then(m => m.ReflexaoSalaComponent),
      },
    ]
  },
  
  // Rota de fallback
  {
    path: '**',
    redirectTo: 'glossario',
  }
];