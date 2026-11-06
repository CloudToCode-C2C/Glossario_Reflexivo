import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  // 1. Verifica se é um Aluno identificado no LocalStorage
  const sessaoAluno = supabaseService.obterSessaoAluno();
  if (sessaoAluno && sessaoAluno.nome && sessaoAluno.escola) {
    return true;
  }

  // 2. Se não for aluno, verifica se é um Professor autenticado na Whitelist
  const isProfessor = await supabaseService.verificarProfessorAutorizado();
  if (isProfessor) {
    return true;
  }

  // 3. Sem sessão válida -> Força ida para /login
  return router.createUrlTree(['/login']);
};

// Guard exclusivo para a futura tela de Admin do Professor
export const adminGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const isProfessor = await supabaseService.verificarProfessorAutorizado();
  if (isProfessor) {
    return true;
  }

  return router.createUrlTree(['/glossario']);
};