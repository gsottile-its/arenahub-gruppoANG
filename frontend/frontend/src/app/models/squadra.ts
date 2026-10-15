export type RuoloSquadra = 'capo_squadra' | 'giocatore' | 'riserva';

export interface MiaSquadra {
  id: number;
  nome: string;
  mioRuolo: RuoloSquadra;
  membri: number;
}

export interface MembroSquadra {
  idUtente: number;
  nickname: string;
  ruoloSquadra: RuoloSquadra;
}

export interface SquadraDettaglio {
  id: number;
  nome: string;
  membri: MembroSquadra[];
}

export interface MembroAggiunto extends MembroSquadra {
  idSquadra: number;
}
