import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    }

    escutarMudancasAuth(callback: (event: string, session: any) => void) {
        return this.supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
        

    async inserirVerbete(verbete: any) {
        const { data, error } = await this.supabase
            .from('verbetes_colaborativos')
            .insert([verbete]);
        
        if (error) throw error;
        return data;
    }

    async buscarVerbetes() {
        const { data, error } = await this.supabase
            .from("verbetes_colaborativos")
            .select("*")
            .order("data_criacao", { ascending: false });
        
        if (error) throw error;
        return data;
    }

    async loginComGoogle() {
        const { error } = await this.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        })
        if (error) throw error;
    }

    async fazerLogout() {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
    }

    async obterSessao() {
        const {data: { session }, error } = await this.supabase.auth.getSession();
        if (error) {
            console.error("Erro ao verificar sessão:", error);
            return null;
        }
        return session;
    }

    async obterUsuarioAtual() {
        const session = await this.obterSessao();
        return session?.user ?? null;
    }

}