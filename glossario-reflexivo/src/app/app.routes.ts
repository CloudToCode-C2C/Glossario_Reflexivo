import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { authGuard } from './auth-guard';
import { GlossarioComponent } from './glossario/glossario';
import { MuralRelatosComponent } from './mural-relatos/mural-relatos';
import { Home } from './home/home'; // Este será o nosso "Sobre"
import { ReflexaoSalaComponent } from './reflexao-sala/reflexao-sala';
import { SobreComponent } from './sobre/sobre';

export const routes: Routes = [
  // 1. ROTA PÚBLICA (Acesso livre)
  {
    path: 'login',
    component: LoginComponent,
  },
  
  // 2. ÁREA RESTRITA (Exige Login)
  {
    path: '',
    canActivate: [authGuard],
    children: [
      // 2.1 A nova página inicial é o Glossário
      {
        path: '',
        component: GlossarioComponent,
      },
      // Suporte para o filtro de categoria criado pelo Arthur
      {
        path: 'glossario/:categoria',
        component: GlossarioComponent,
      },
      {
        path: 'glossario',
        redirectTo: '',
        pathMatch: 'full',
      },

      // 2.2 A aba Fórum/Mural
      {
        path: 'forum',
        component: MuralRelatosComponent,
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
        component: SobreComponent, 
      },
      // Redireciona a antiga rota 'home' para o sobre
      {
        path: 'home',
        redirectTo: 'sobre',
      },

      // 2.4 Rotas adicionais do projeto do Arthur
      {
        path: 'reflexao/:id',
        component: ReflexaoSalaComponent,
      },
    ]
  },
  
  // Rota de fallback
  {
    path: '**',
    redirectTo: '',
  }
];