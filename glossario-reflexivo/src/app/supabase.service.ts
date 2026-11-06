import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

export const ESCOLAS_PERMITIDAS = [
  'Instituto Federal de Brasília - Campus Ceilândia',
  'Centro de Ensino Fundamental 14 de Samambaia',
  'Centro Educacional 02 de Taguatinga',
];

export const SERIES_PERMITIDAS = ['6º Ano', '7º Ano', '8º Ano', '9º Ano', 'Ensino Médio'];

export const TURMAS_PERMITIDAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const EMAIL_SUPORTE_C2C = 'cloudtocode@outlook.com';

export interface SessaoAluno {
  perfil: 'ALUNO';
  nome: string;
  escola: string;
  serie: string;
  turma: string;
}

export interface FiltroProfessor {
  escola: string; // 'TODAS' ou nome da escola
  serie: string;  // 'TODAS' ou série específica
  turma: string;  // 'TODAS' ou letra da turma
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // Estado reativo para avisar o AppComponent quando o Aluno entra ou sai
  private sessaoAlunoSubject = new BehaviorSubject<SessaoAluno | null>(this.obterSessaoAluno());
  public sessaoAluno$ = this.sessaoAlunoSubject.asObservable();

  // Estado reativo do Filtro Global do Professor (reflete em todas as abas)
  private filtroProfessorSubject = new BehaviorSubject<FiltroProfessor>({
    escola: 'TODAS',
    serie: 'TODAS',
    turma: 'TODAS'
  });
  public filtroProfessor$ = this.filtroProfessorSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  escutarMudancasAuth(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  salvarSessaoAluno(dados: Omit<SessaoAluno, 'perfil'>): void {
    const sessao: SessaoAluno = { ...dados, perfil: 'ALUNO' };
    localStorage.setItem('c2c_sessao_aluno', JSON.stringify(sessao));
    this.sessaoAlunoSubject.next(sessao);
  }

  obterSessaoAluno(): SessaoAluno | null {
    const raw = localStorage.getItem('c2c_sessao_aluno');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessaoAluno;
    } catch {
      return null;
    }
  }

  atualizarFiltroProfessor(parcial: Partial<FiltroProfessor>): void {
    const atual = this.filtroProfessorSubject.value;
    this.filtroProfessorSubject.next({ ...atual, ...parcial });
  }

  obterFiltroProfessorAtual(): FiltroProfessor {
    return this.filtroProfessorSubject.value;
  }

  async loginComGoogle() {
    localStorage.removeItem('c2c_sessao_aluno');
    this.sessaoAlunoSubject.next(null);

    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login` }
    });
    if (error) throw error;
    return data;
  }

  // Agora limpa tanto o LocalStorage do aluno quanto o OAuth do professor
  async fazerLogout() {
    localStorage.removeItem('c2c_sessao_aluno');
    this.sessaoAlunoSubject.next(null);
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async limparSessaoCompleta(): Promise<void> {
    await this.fazerLogout();
  }

  async obterSessao() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) {
      console.error('Erro ao verificar sessão:', error);
      return null;
    }
    return session;
  }

  async verificarProfessorAutorizado(): Promise<boolean> {
    const { data: sessionData } = await this.supabase.auth.getSession();
    if (!sessionData.session?.user) return false;

    const { data, error } = await this.supabase.rpc('is_admin');
    if (error) {
      console.error('Erro ao verificar permissão de professor:', error);
      return false;
    }
    return !!data;
  }

  async obterUsuarioAtual() {
    const session = await this.obterSessao();
    return session?.user ?? null;
  }

  // --- BUSCAS SEGURAS (Respeitando permissões de coluna do Aluno e Filtro do Professor) ---

  async buscarVerbetes(): Promise<any[]> {
    const aluno = this.obterSessaoAluno();
    const isProf = !aluno && (await this.verificarProfessorAutorizado());

    let query = isProf
      ? this.supabase
          .from('verbetes_colaborativos')
          .select('*')
          .order('data_criacao', { ascending: false })
      : this.supabase
          .from('verbetes_colaborativos')
          .select('id,contexto,expressao,significado,escola,status_aprovado,data_criacao').eq('status_aprovado', true)
          .order('data_criacao', { ascending: false });

    if (aluno) {
      query = query.or(`escola.eq."${aluno.escola}",escola.is.null`);
    } else if (isProf) {
      query = this.aplicarFiltroQueryProfessor(query);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as any[]) || [];
  }

  async inserirVerbete(verbete: any) {
    const { data, error } = await this.supabase
      .from('verbetes_colaborativos')
      .insert([verbete]);
    if (error) throw error;
    return data;
  }

  async buscarRelatos(): Promise<any[]> {
    const aluno = this.obterSessaoAluno();
    const isProf = !aluno && (await this.verificarProfessorAutorizado());

    let query = isProf
      ? this.supabase
          .from('relatos')
          .select('*')
          .order('created_at', { ascending: false })
      : this.supabase
          .from('relatos')
          .select('id,texto,escola,status_aprovado,created_at').eq('status_aprovado', true)
          .order('created_at', { ascending: false });

    if (aluno) {
      query = query.or(`escola.eq."${aluno.escola}",escola.is.null`);
    } else if (isProf) {
      query = this.aplicarFiltroQueryProfessor(query);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar relatos:', error);
      throw error;
    }
    return (data as any[]) || [];
  }

  async inserirRelato(relato: any) {
    const { error } = await this.supabase
      .from('relatos')
      .insert([relato]);
    if (error) throw error;
  }

  async buscarRespostasReflexao(perguntaId: number): Promise<any[]> {
    const aluno = this.obterSessaoAluno();
    const isProf = !aluno && (await this.verificarProfessorAutorizado());

    let query = isProf
      ? this.supabase
          .from('respostas_reflexao')
          .select('*')
          .eq('pergunta_id', perguntaId)
          .order('created_at', { ascending: true })
      : this.supabase
          .from('respostas_reflexao')
          .select('id,pergunta_id,texto,escola,status_aprovado,created_at')
          .eq('status_aprovado', true)
          .eq('pergunta_id', perguntaId)
          .order('created_at', { ascending: true });

    if (aluno) {
      query = query.or(`escola.eq."${aluno.escola}",escola.is.null`);
    } else if (isProf) {
      query = this.aplicarFiltroQueryProfessor(query);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as any[]) || [];
  }

  async inserirRespostaReflexao(resposta: any) {
    const { data, error } = await this.supabase
      .from('respostas_reflexao')
      .insert([resposta]);
    if (error) throw error;
    return data;
  }

  private aplicarFiltroQueryProfessor(query: any) {
    const filtro = this.filtroProfessorSubject.value;
    if (filtro.escola !== 'TODAS') {
      query = query.eq('escola', filtro.escola);
    }
    if (filtro.serie !== 'TODAS') {
      query = query.eq('serie', filtro.serie);
    }
    if (filtro.turma !== 'TODAS') {
      query = query.eq('turma', filtro.turma);
    }
    return query;
  }

  async listarRegistrosAdmin(
    tabela: 'verbetes_colaborativos' | 'relatos' | 'respostas_reflexao'
  ): Promise<any[]> {
    const colunaOrdem = tabela === 'verbetes_colaborativos' ? 'data_criacao' : 'created_at';

    let query = this.supabase
      .from(tabela)
      .select('*')
      .order(colunaOrdem, { ascending: false });

    // Aplica o mesmo filtro global do topo (Escola, Série, Turma) na tabela de moderação
    query = this.aplicarFiltroQueryProfessor(query);

    const { data, error } = await query;
    if (error) throw error;
    return (data as any[]) || [];
  }

  async atualizarStatusAprovacao(
    tabela: 'verbetes_colaborativos' | 'relatos' | 'respostas_reflexao',
    id: string | number,
    status_aprovado: boolean
  ): Promise<void> {
    const { error } = await this.supabase
      .from(tabela)
      .update({ status_aprovado })
      .eq('id', id);

    if (error) throw error;
  }

  async excluirRegistroAdmin(
    tabela: 'verbetes_colaborativos' | 'relatos' | 'respostas_reflexao',
    id: string | number
  ): Promise<void> {
    const { error } = await this.supabase
      .from(tabela)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}