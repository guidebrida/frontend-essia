export interface Arquivo {
    id: number;
    nome: string;
    diretorio: Diretorio;
}

export interface Diretorio {
    id: number;
    nome: string;
    diretorio_id: number;
    arquivos?: Arquivo[];
}
