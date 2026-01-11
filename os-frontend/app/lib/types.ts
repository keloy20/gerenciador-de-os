export interface User {
  _id: string;
  nome: string;
  email: string;
  role: "admin" | "tecnico";
  telefone?: string;
}

export interface Service {
  _id: string;
  osNumero: string;
  cliente: string;
  subgrupo?: string;
  marca?: string;
  unidade?: string;
  endereco: string;
  tipoServico: string;
  status: "aguardando_tecnico" | "em_andamento" | "concluido";
  tecnico: User;
  dataServico: string;
  antes?: {
    fotos: string[];
    relatorio: string;
    observacao: string;
  };
  depois?: {
    fotos: string[];
    relatorio: string;
    observacao: string;
  };
}
