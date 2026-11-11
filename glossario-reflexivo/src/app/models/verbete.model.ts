// Campos usados para representar um verbete armazenado e exibido no glossário.
export interface Verbete {
    id: number;
    expressao: string;
    significado: string;
    contexto: string;
    data_criacao: Date;
}