// Modelo mínimo usado para representar um verbete persistido.
export interface Verbete {
    id: number;
    expressao: string;
    significado: string;
    contexto: string;
    data_criacao: Date;
}