export interface Tipologia {
  id: number;
  nome: string;
}

export interface Gioco {
  id: number;
  nome: string;
  descrizione: string | null;
  tipologia: Tipologia;
}

export interface Piattaforma {
  id: number;
  nome: string;
}
