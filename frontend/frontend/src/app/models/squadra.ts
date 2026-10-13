export type RuoloSquadra = 'capo_squadra' | 'giocatore' | 'riserva';

export interface MiaSquadra {
  id: number;
  nome: string;
  mioRuolo: RuoloSquadra;
  membri: number;
}
