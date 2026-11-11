import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  // Aluno com sessão válida.
  const sessaoAluno = supabaseService.obterSessaoAluno();
  if (sessaoAluno && sessaoAluno.nome && sessaoAluno.escola) {
    return true;
  }

  // Professor autorizado.
  const isProfessor = await supabaseService.verificarProfessorAutorizado();
  if (isProfessor) {
    return true;
  }

  // Sem sessão válida, envia para o login.
  return router.createUrlTree(['/login']);
};

// Restringe o painel a professores autorizados.
export const adminGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const isProfessor = await supabaseService.verificarProfessorAutorizado();
  if (isProfessor) {
    return true;
  }

  return router.createUrlTree(['/glossario']);
};