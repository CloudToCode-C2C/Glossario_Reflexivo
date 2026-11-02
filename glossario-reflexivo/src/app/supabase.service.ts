import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

// Fachada única para autenticação e persistência das contribuições do aplicativo.
@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    }

    // Encaminha eventos de sessão para que a raiz atualize a navegação.
    escutarMudancasAuth(callback: (event: string, session: any) => void) {
        return this.supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
        

    // Persiste um verbete enviado pelo formulário; a aprovação é responsabilidade do banco.
    async inserirVerbete(verbete: any) {
        const { data, error } = await this.supabase
            .from('verbetes_colaborativos')
            .insert([verbete]);
        
        if (error) throw error;
        return data;
    }

    // Busca os verbetes em ordem cronológica para o mural.
    async buscarVerbetes() {
        const { data, error } = await this.supabase
            .from("verbetes_colaborativos")
            .select("*")
            .order("data_criacao", { ascending: false });
        
        if (error) throw error;
        return data;
    }

    // Inicia o fluxo OAuth e retorna o usuário à origem da aplicação.
    async loginComGoogle() {
        const { error } = await this.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        })
        if (error) throw error;
    }

    // Encerra a sessão local e remota do usuário.
    async fazerLogout() {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
    }

    // Consulta a sessão atual sem interromper o fluxo da interface em caso de erro.
    async obterSessao() {
        const {data: { session }, error } = await this.supabase.auth.getSession();
        if (error) {
            console.error("Erro ao verificar sessão:", error);
            return null;
        }
        return session;
    }

    // Reduz a sessão ao usuário usado pelos formulários de autoria.
    async obterUsuarioAtual() {
        const session = await this.obterSessao();
        return session?.user ?? null;
    }

    // Isola as operações do mural de relatos das operações do glossário.
    // Carrega o feed de relatos em ordem do mais recente para o mais antigo.
    async buscarRelatos() {
        const { data, error } = await this.supabase
            .from('relatos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erro ao buscar relatos:", error);
            throw error;
        }
        return data || [];
    }

    // Envia um relato para moderação sem inseri-lo no feed local.
    async inserirRelato(relato: any) {
        const { error } = await this.supabase
            .from('relatos')
            .insert([relato]);

        if (error) throw error;
    }

    // Recupera as respostas de uma pergunta na ordem de uma conversa.
    async buscarRespostasReflexao(perguntaId: number) {
        const { data, error } = await this.supabase
            .from('respostas_reflexao')
            .select('*')
            .eq('pergunta_id', perguntaId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    // Persiste uma resposta como pendente até a aprovação da moderação.
    async inserirRespostaReflexao(resposta: {
        pergunta_id: number;
        texto: string;
        autor_email: string;
        status_aprovado: boolean;
    }) {
        const { data, error } = await this.supabase
            .from('respostas_reflexao')
            .insert([resposta]);

        if (error) throw error;
        return data;
    }
}