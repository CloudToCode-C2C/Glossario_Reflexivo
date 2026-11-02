import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Inicializa a aplicação standalone com a configuração global de provedores.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
