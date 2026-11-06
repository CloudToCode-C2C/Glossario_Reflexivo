import { Routes } from '@angular/router';
import { Home } from './home/home';
import { LoginComponent } from './login/login';
import { adminGuard, authGuard } from './auth-guard';
import { GlossarioComponent } from './glossario/glossario';
import { FormularioComponent } from './formulario/formulario';
import { MuralRelatosComponent } from './mural-relatos/mural-relatos';
import { SobreComponent } from './sobre/sobre';
import { ReflexaoSalaComponent } from './reflexao-sala/reflexao-sala';
import { AdminComponent } from './admin/admin';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'glossario',
        pathMatch: 'full',
      },
      {
        path: 'glossario',
        component: GlossarioComponent,
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        component: AdminComponent,
      },
      {
        path: 'glossario/:categoria',
        component: GlossarioComponent,
      },
      {
        path: 'home',
        component: Home,
      },
      {
        path: 'formulario',
        component: FormularioComponent,
        data: {
          categoriaAtual: 'Capacitismo',
        },
      },
      {
        path: 'forum',
        component: MuralRelatosComponent,
      },
      {
        path: 'mural',
        redirectTo: 'forum',
        pathMatch: 'full',
      },
      {
        path: 'sobre',
        component: SobreComponent,
      },
      {
        path: 'reflexao/:id',
        component: ReflexaoSalaComponent,
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'glossario',
  }
];