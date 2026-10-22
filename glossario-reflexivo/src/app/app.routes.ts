import { Routes } from '@angular/router';
import { Home } from './home/home';
import { FormularioComponent } from './formulario/formulario';
import { MuralRelatosComponent } from './mural-relatos/mural-relatos';

export const routes: Routes = [
  //Rotta inicial
  {
    path: '',
    component: Home,
    pathMatch: 'full',
  },

  {
    path: 'glossario',
    component: FormularioComponent,
    data: {
      categoriaAtual: 'Capacitismo',
    },
  },
  {
    path: 'mural',
    component: MuralRelatosComponent,
  },

  //Rota de segurança
  {
    path: '**',
    redirectTo: ''
  }
];
