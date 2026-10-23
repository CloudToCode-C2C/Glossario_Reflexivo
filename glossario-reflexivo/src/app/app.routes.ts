import { Routes } from '@angular/router';
import { Home } from './home/home';
import { GlossarioComponent } from './glossario/glossario';
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
    component: GlossarioComponent, // 2. Aponte a rota para o seu componente!
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
