import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { adminGuard, authGuard } from './auth-guard';
import { GlossarioComponent } from './glossario/glossario';
import { MuralRelatosComponent } from './mural-relatos/mural-relatos';
import { ReflexaoSalaComponent } from './reflexao-sala/reflexao-sala';
import { AdminComponent } from './admin/admin';
import { SobreComponent } from './sobre/sobre';

export const routes: Routes = [
  // Rotas públicas
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.LoginComponent),
  },
  
  // Rotas protegidas
  {
    path: '',
    canActivate: [authGuard],
    children: [
      // Glossário
      {
        path: '',
        loadComponent: () => import('./glossario/glossario').then(m => m.GlossarioComponent),
      },
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

      // Fórum de relatos
      {
        path: 'forum',
        loadComponent: () => import('./mural-relatos/mural-relatos').then(m => m.MuralRelatosComponent),
      },
      {
        path: 'mural',
        redirectTo: 'forum',
        pathMatch: 'full',
      },

      // Página sobre
      {
        path: 'sobre',
        loadComponent: () => import('./sobre/sobre').then(m => m.SobreComponent), 
      },
      // Mantém a rota antiga
      {
        path: 'home',
        redirectTo: 'sobre',
      },

      // Sala de reflexão
      {
        path: 'reflexao/:id',
        loadComponent: () => import('./reflexao-sala/reflexao-sala').then(m => m.ReflexaoSalaComponent),
      },
    ]
  },
  
  // Rotas desconhecidas voltam ao glossário
  {
    path: '**',
    redirectTo: 'glossario',
  }
];