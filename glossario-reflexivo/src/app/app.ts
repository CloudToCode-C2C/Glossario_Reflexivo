import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { FormularioComponent } from './formulario/formulario';
import { BottomNavComponent } from './bottom-nav/bottom-nav';

@Component({
  imports: [RouterOutlet, /*FormularioComponent,*/ BottomNavComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('glossario-reflexivo');
}
