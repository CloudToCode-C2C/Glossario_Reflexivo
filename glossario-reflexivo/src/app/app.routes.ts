import { Routes } from '@angular/router';
import { Home } from './home/home';
import { LoginComponent } from './login/login';
import { authGuard } from './auth-guard';
import { GlossarioComponent } from './glossario/glossario';
import { FormularioComponent } from './formulario/formulario';
import { MuralRelatosComponent } from './mural-relatos/mural-relatos';
import { MuralComponent } from './mural/mural';

export const routes: Routes = [
  //Rotta inicial
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [ // Aqui vão os componentes filhos que só podem ser acessados se o usuário estiver logado
      {
        path: '',
      component: Home,
      },
      {
        path: 'glossario',
        component: GlossarioComponent, 
      },
      {
        path: 'formulario',
        component: FormularioComponent,
        data: {
          categoriaAtual: 'Capacitismo',
        },
      },
      {
        path: 'mural',
        component: MuralRelatosComponent,
      },
    ]
  },
  //Rota de segurança
  {
    path: '**',
    redirectTo: ''
  }
];
