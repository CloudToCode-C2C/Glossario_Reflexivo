import { Routes } from '@angular/router';
import { FormularioComponent } from './formulario/formulario';
import { MuralRelatosComponent } from './mural-relatos/mural-relatos';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'glossario',
    pathMatch: 'full',
  },
  {
    path: 'glossario',
    component: FormularioComponent,
  },
  {
    path: 'mural',
    component: MuralRelatosComponent,
  },
];
