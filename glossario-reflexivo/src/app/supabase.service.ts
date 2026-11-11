import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

export const ESCOLAS_PADRAO = [
  'Instituto Federal de Brasília - Campus Ceilândia',
  'Centro de Ensino Fundamental 14 de Samambaia',
  'Centro Educacional 02 de Taguatinga',
];

// Mantém o nome antigo para os componentes que ainda importam essa constante.
export const ESCOLAS_PERMITIDAS = ESCOLAS_PADRAO;

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

export interface VideoCategoria {
  id: number;
  categoria: string;
  titulo: string;
  youtube_id: string;
  url_original: string;
  autor_email?: string | null;
  escola?: string | null;
  fixo_sistema: boolean;
  created_at: string;
}

export interface FiltroProfessor {
  escola: string; // 'TODAS' aplica o filtro a todas as escolas.
  serie: string; // 'TODAS' inclui todas as séries.
  turma: string; // 'TODAS' inclui todas as turmas.
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private escolasPermitidasSubject = new BehaviorSubject<string[]>(ESCOLAS_PADRAO);
  public escolasPermitidas$ = this.escolasPermitidasSubject.asObservable();

  // Compartilha o estado da sessão local do aluno com os componentes inscritos.
  private sessaoAlunoSubject = new BehaviorSubject<SessaoAluno | null>(this.obterSessaoAluno());
  public sessaoAluno$ = this.sessaoAlunoSubject.asObservable();

  // Os filtros do professor são compartilhados pelas listas e pelo painel de moderação.
  private filtroProfessorSubject = new BehaviorSubject<FiltroProfessor>({
    escola: 'TODAS',
    serie: 'TODAS',
    turma: 'TODAS',
  });
  public filtroProfessor$ = this.filtroProfessorSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Encaminha aos componentes as mudanças de autenticação emitidas pelo Supabase.
  escutarMudancasAuth(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  // Salva os dados do aluno no navegador e publica a nova sessão para o restante do app.
  salvarSessaoAluno(dados: Omit<SessaoAluno, 'perfil'>): void {
    const sessao: SessaoAluno = { ...dados, perfil: 'ALUNO' };
    localStorage.setItem('c2c_sessao_aluno', JSON.stringify(sessao));
    this.sessaoAlunoSubject.next(sessao);
  }

  // Valida os dados locais antes de usá-los como identidade ou filtro de acesso.
  obterSessaoAluno(): SessaoAluno | null {
    const raw = localStorage.getItem('c2c_sessao_aluno');
    if (!raw) return null;
    try {
      const sessao = JSON.parse(raw) as SessaoAluno;
      const nomeValido =
        typeof sessao.nome === 'string' &&
        sessao.nome.trim().length >= 3 &&
        sessao.nome.trim().length <= 120;
      const escolaValida = this.escolasPermitidasSubject.value.includes(sessao.escola);
      const serieValida = SERIES_PERMITIDAS.includes(sessao.serie);
      const turmaValida = TURMAS_PERMITIDAS.includes(sessao.turma);

      // Descarta a sessão se algum dado não corresponder aos valores aceitos pelo app.
      if (!nomeValido || !escolaValida || !serieValida || !turmaValida) {
        localStorage.removeItem('c2c_sessao_aluno');
        return null;
      }
      return sessao;
    } catch {
      localStorage.removeItem('c2c_sessao_aluno');
      return null;
    }
  }

  // Atualiza apenas os campos informados e mantém os demais filtros atuais.
  atualizarFiltroProfessor(parcial: Partial<FiltroProfessor>): void {
    const atual = this.filtroProfessorSubject.value;
    this.filtroProfessorSubject.next({ ...atual, ...parcial });
  }

  // Devolve os filtros vigentes para as telas que precisam iniciar com o estado atual.
  obterFiltroProfessorAtual(): FiltroProfessor {
    return this.filtroProfessorSubject.value;
  }

  // Usado para validar escolas e montar as opções dos formulários.
  obterEscolasAtuais(): string[] {
    return this.escolasPermitidasSubject.value;
  }

  // Aceita os formatos comuns de link do YouTube e retorna o identificador do vídeo.
  extrairYoutubeId(url: string): string | null {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.trim().match(regex);
    return match ? match[1] : null;
  }

  // Carrega apenas escolas aprovadas; se a consulta não trouxer dados, mantém a lista atual.
  async carregarEscolasAprovadas(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('escolas')
      .select('identificador_completo')
      .eq('status_aprovado', true)
      .order('identificador_completo', { ascending: true });

    if (!error && data && data.length > 0) {
      const lista = data.map((item: any) => item.identificador_completo as string);
      this.escolasPermitidasSubject.next(lista);
      return lista;
    }
    return this.escolasPermitidasSubject.value;
  }

  // Encaminha o pedido de acesso para a função do banco, que registra professor e escola.
  async solicitarAcessoProfessor(dados: {
    nome: string;
    email: string;
    escolaExistente?: string;
    novaEscolaNome?: string;
    novaEscolaCidade?: string;
  }): Promise<'CRIADO' | 'CRIADO_COM_ESCOLA' | 'JA_PENDENTE' | 'JA_APROVADO'> {
    const { data, error } = await this.supabase.rpc('solicitar_acesso_professor', {
      p_nome: dados.nome,
      p_email: dados.email,
      p_escola_existente: dados.escolaExistente ?? null,
      p_nova_escola_nome: dados.novaEscolaNome ?? null,
      p_nova_escola_cidade: dados.novaEscolaCidade ?? null,
    });

    if (error) {
      console.error('Erro ao solicitar acesso de professor:', error);
      throw error;
    }

    return data as 'CRIADO' | 'CRIADO_COM_ESCOLA' | 'JA_PENDENTE' | 'JA_APROVADO';
  }

  // Inicia o fluxo OAuth e remove uma possível sessão local de aluno antes do redirecionamento.
  async loginComGoogle() {
    localStorage.removeItem('c2c_sessao_aluno');
    this.sessaoAlunoSubject.next(null);

    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (error) throw error;
    return data;
  }

  // Encerra a sessão local do aluno e a autenticação do professor.
  async fazerLogout() {
    localStorage.removeItem('c2c_sessao_aluno');
    this.sessaoAlunoSubject.next(null);
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  // Mantém uma única operação para encerrar qualquer tipo de sessão ativa.
  async limparSessaoCompleta(): Promise<void> {
    await this.fazerLogout();
  }

  // Consulta a sessão do Supabase e retorna null quando ela não pode ser recuperada.
  async obterSessao() {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();
    if (error) {
      console.error('Erro ao verificar sessão:', error);
      return null;
    }
    return session;
  }

  // A autorização é confirmada no banco, não apenas pela existência de uma sessão OAuth.
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

  // Entrega ao app a identidade associada à sessão atual do Supabase.
  async obterUsuarioAtual() {
    const session = await this.obterSessao();
    return session?.user ?? null;
  }

  // Consultas públicas retornam apenas conteúdo aprovado e respeitam o perfil e os filtros.

  // Os alunos veem contribuições da própria escola; professores podem filtrar os resultados.
  async buscarVerbetes(): Promise<any[]> {
    const aluno = this.obterSessaoAluno();
    const isProf = !aluno && (await this.verificarProfessorAutorizado());

    let query = this.supabase
      .from('verbetes_colaborativos')
      .select('id,contexto,expressao,significado,escola,status_aprovado,data_criacao:created_at')
      .eq('status_aprovado', true)
      .order('created_at', { ascending: false });

    if (aluno) {
      // A validação da sessão garante que a escola pertence à lista permitida.
      query = query.or(`escola.eq."${aluno.escola}",escola.is.null`);
    } else if (isProf) {
      query = this.aplicarFiltroQueryProfessor(query);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as any[]) || [];
  }

  // Novos verbetes ficam pendentes até a revisão de um professor.
  async inserirVerbete(verbete: any) {
    const { data, error } = await this.supabase.from('verbetes_colaborativos').insert([verbete]);
    if (error) throw error;
    return data;
  }

  // Aplica aos relatos aprovados as mesmas regras de visibilidade usadas no glossário.
  async buscarRelatos(): Promise<any[]> {
    const aluno = this.obterSessaoAluno();
    const isProf = !aluno && (await this.verificarProfessorAutorizado());

    let query = this.supabase
      .from('relatos')
      .select('id,texto,escola,status_aprovado,created_at')
      .eq('status_aprovado', true)
      .order('created_at', { ascending: false });

    if (aluno) {
      query = query.or(`escola.eq."${aluno.escola}",escola.is.null`);
    } else if (isProf) {
      query = this.aplicarFiltroQueryProfessor(query);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as any[]) || [];
  }

  // Relatos enviados aguardam aprovação antes de aparecerem no feed.
  async inserirRelato(relato: any) {
    const { error } = await this.supabase.from('relatos').insert([relato]);
    if (error) throw error;
  }

  // Busca as respostas aprovadas da pergunta indicada e respeita os filtros do perfil.
  async buscarRespostasReflexao(perguntaId: number): Promise<any[]> {
    const aluno = this.obterSessaoAluno();
    const isProf = !aluno && (await this.verificarProfessorAutorizado());

    let query = this.supabase
      .from('respostas_reflexao')
      .select('id,pergunta_id,texto,escola,status_aprovado,created_at')
      .eq('pergunta_id', perguntaId)
      .eq('status_aprovado', true)
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

  // Respostas novas entram na fila de moderação.
  async inserirRespostaReflexao(resposta: any) {
    const { data, error } = await this.supabase.from('respostas_reflexao').insert([resposta]);
    if (error) throw error;
    return data;
  }

  // Professores recebem os dados completos; os demais perfis recebem apenas campos públicos.
  async buscarVideosPorCategoria(categoria?: string): Promise<VideoCategoria[]> {
    const isProf = await this.verificarProfessorAutorizado();

    let query = isProf
      ? this.supabase
        .from('videos_categoria')
        .select('*')
        .order('fixo_sistema', { ascending: false })
        .order('created_at', { ascending: true })
      : this.supabase
        .from('videos_categoria')
        .select('id, categoria, titulo, youtube_id, url_original, escola, fixo_sistema, created_at')
        .order("fixo_sistema", { ascending: false })
        .order('created_at', { ascending: true });

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as VideoCategoria[]) || [];
  }

  // Só professores autorizados podem cadastrar vídeos na playlist de uma categoria.
  async inserirVideoCategoria(dados: {
    categoria: string;
    titulo: string;
    url: string;
    escola?: string | null;
  }): Promise<void> {
    await this.exigirProfessorAutorizado();
    const usuario = await this.obterUsuarioAtual();
    const youtubeId = this.extrairYoutubeId(dados.url);
    if (!youtubeId) {
      throw new Error('URL do YouTube inválida.');
    }

    const { error } = await this.supabase.from('videos_categoria').insert([
      {
        categoria: dados.categoria,
        titulo: dados.titulo.trim(),
        youtube_id: youtubeId,
        url_original: dados.url.trim(),
        autor_email: usuario?.email ?? null,
        escola: dados.escola && dados.escola !== 'TODAS' ? dados.escola : null,
        fixo_sistema: false,
      }
    ]);

    if (error) throw error;
  }

  // Exclui o vídeo depois de confirmar que a operação vem de um professor autorizado.
  async excluirVideoCategoria(id: number): Promise<void> {
    await this.exigirProfessorAutorizado();
    const { error } = await this.supabase
      .from('videos_categoria')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Limpa qualquer sessão anterior antes de autenticar o professor com senha.
  async loginComEmailSenha(email: string, password: string): Promise<void> {
    await this.limparSessaoCompleta();
    const { error } = await this.supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw error;
  }

  // Normaliza as mensagens do Supabase para identificar quando falta confirmar o e-mail.
  isEmailConfirmationError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    const authError = error as {
      code?: unknown;
      message?: unknown;
      error_description?: unknown;
    };
    const details = [authError.code, authError.message, authError.error_description]
      .filter((value): value is string => typeof value === 'string')
      .join(' ')
      .toLowerCase()
      .replace(/[_-]/g, ' ');

    return (
      details.includes('email not confirmed') ||
      details.includes('email confirmation required') ||
      details.includes('confirm your email') ||
      details.includes('confirm the email')
    );
  }

  // Solicita ao Supabase um novo e-mail de confirmação para a conta.
  async reenviarConfirmacaoEmail(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) throw error;
  }

  // Cria a credencial inicial do professor no Auth; o cadastro ainda depende de autorização.
  async criarCredencialAuthProfessor(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (error.status === 429 || error.message.toLowerCase().includes('already registered')) {
        console.warn("Aviso do Auth: Conta já existente ou limite temporário atingido. Prosseguindo com o fluxo da C2C.");
        return;
      }
      throw error;
    }
    
    if (!data.user) throw new Error('O Supabase não retornou o usuário criado.');

    // O RPC seguinte usa a sessão criada aqui para registrar o pedido de autorização.
    // await this.supabase.auth.signOut();
  }

  // Aplica os filtros selecionados pelo professor a uma consulta compatível com essas colunas.
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

  // Centraliza a checagem antes de qualquer alteração disponível apenas ao professor.
  private async exigirProfessorAutorizado(): Promise<void> {
    const autorizado = await this.verificarProfessorAutorizado();
    if (!autorizado) {
      throw new Error('Acesso negado: operação exclusiva para professores autorizados.');
    }
  }

  // Lista as contribuições da aba atual com os filtros escolhidos no cabeçalho.
  async listarRegistrosAdmin(
    tabela: 'verbetes_colaborativos' | 'relatos' | 'respostas_reflexao',
  ): Promise<any[]> {
    await this.exigirProfessorAutorizado();
    const colunaOrdem = 'created_at';

    let query = this.supabase.from(tabela).select('*').order(colunaOrdem, { ascending: false });

    query = this.aplicarFiltroQueryProfessor(query);

    const { data, error } = await query;
    if (error) throw error;
    return (data as any[]) || [];
  }

  // Altera a aprovação de uma contribuição depois de confirmar a permissão docente.
  async atualizarStatusAprovacao(
    tabela: 'verbetes_colaborativos' | 'relatos' | 'respostas_reflexao',
    id: string | number,
    status_aprovado: boolean,
  ): Promise<void> {
    await this.exigirProfessorAutorizado();
    const { error } = await this.supabase.from(tabela).update({ status_aprovado }).eq('id', id);

    if (error) throw error;
  }

  // Remove uma contribuição do painel após validar que a operação é autorizada.
  async excluirRegistroAdmin(
    tabela: 'verbetes_colaborativos' | 'relatos' | 'respostas_reflexao',
    id: string | number,
  ): Promise<void> {
    await this.exigirProfessorAutorizado();
    const { error } = await this.supabase.from(tabela).delete().eq('id', id);

    if (error) throw error;
  }
}
