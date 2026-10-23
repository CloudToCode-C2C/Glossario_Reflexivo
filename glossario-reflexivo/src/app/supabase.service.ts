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
}