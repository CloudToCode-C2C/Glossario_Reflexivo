import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Inicia a aplicação standalone e carrega os provedores usados em todo o app.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
