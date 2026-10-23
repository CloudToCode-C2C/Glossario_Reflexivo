import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './bottom-nav/bottom-nav';
import { FormularioComponent } from './formulario/formulario';
import { MuralComponent } from './mural/mural';

@Component({
  imports: [RouterOutlet, BottomNavComponent, FormularioComponent, MuralComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('glossario-reflexivo');
}
