import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  // Alunos entram com a sessão local, desde que os dados básicos estejam preenchidos.
  const sessaoAluno = supabaseService.obterSessaoAluno();
  if (sessaoAluno && sessaoAluno.nome && sessaoAluno.escola) {
    return true;
  }

  // Se não houver sessão de aluno, verifica a autorização do professor no Supabase.
  const isProfessor = await supabaseService.verificarProfessorAutorizado();
  if (isProfessor) {
    return true;
  }

  // Sem uma das duas sessões, direciona a pessoa para o login.
  return router.createUrlTree(['/login']);
};

// O painel de administração é reservado a professores autorizados.
export const adminGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const isProfessor = await supabaseService.verificarProfessorAutorizado();
  if (isProfessor) {
    return true;
  }

  return router.createUrlTree(['/glossario']);
};