import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

// Permite rotas protegidas somente quando há uma sessão Supabase válida.
export const authGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const session = await supabaseService.obterSessao();

  if (session) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
