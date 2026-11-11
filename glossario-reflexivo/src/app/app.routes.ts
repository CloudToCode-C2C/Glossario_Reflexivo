import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { adminGuard, authGuard } from './auth-guard';
import { GlossarioComponent } from './glossario/glossario';
import { MuralRelatosComponent } from './mural-relatos/mural-relatos';
import { ReflexaoSalaComponent } from './reflexao-sala/reflexao-sala';
import { AdminComponent } from './admin/admin';
import { SobreComponent } from './sobre/sobre';

export const routes: Routes = [
  // O login fica público; as outras páginas exigem uma sessão válida.
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.LoginComponent),
  },
  
  // As rotas abaixo compartilham a verificação de acesso.
  {
    path: '',
    canActivate: [authGuard],
    children: [
      // O glossário é a página inicial da área protegida.
      {
        path: '',
        loadComponent: () => import('./glossario/glossario').then(m => m.GlossarioComponent),
      },
      // O painel é restrito a professores autorizados.
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

      // O fórum reúne os relatos enviados pela comunidade.
      {
        path: 'forum',
        loadComponent: () => import('./mural-relatos/mural-relatos').then(m => m.MuralRelatosComponent),
      },
      {
        path: 'mural',
        redirectTo: 'forum',
        pathMatch: 'full',
      },

      // A página apresenta o projeto e sua fundamentação.
      {
        path: 'sobre',
        loadComponent: () => import('./sobre/sobre').then(m => m.SobreComponent), 
      },
      // Mantém compatibilidade com links antigos para /home.
      {
        path: 'home',
        redirectTo: 'sobre',
      },

      // Cada sala corresponde a uma pergunta de reflexão.
      {
        path: 'reflexao/:id',
        loadComponent: () => import('./reflexao-sala/reflexao-sala').then(m => m.ReflexaoSalaComponent),
      },
    ]
  },
  
  // Caminhos que não existem voltam à página inicial.
  {
    path: '**',
    redirectTo: 'glossario',
  }
];