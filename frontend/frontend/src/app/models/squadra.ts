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

// risposta di post /api/squadre
export interface SquadraCreata {
  id: number;
  nome: string;
  membri: MembroSquadra[];
}

// risposta di post /api/squadre/{id}/membri
export interface MembroAggiunto extends MembroSquadra {
  idSquadra: number;
}
