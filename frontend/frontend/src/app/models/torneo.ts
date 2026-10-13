export type StatoTorneo =
  | 'bozza'
  | 'iscrizioni_aperte'
  | 'iscrizioni_chiuse'
  | 'in_corso'
  | 'concluso'
  | 'annullato';

export type StatoIscrizione = 'lista_attesa' | 'in_attesa' | 'confermata' | 'ritirata';

export interface TorneoCard {
  id: number;
  nome: string;
  urlImmagine: string | null;
  gioco: string;
  piattaforme: string[];
  giocatoriPerSquadra: number;
  postiMax: number;
  iscritti: number;
  stato: StatoTorneo;
  mioStato: StatoIscrizione | null;
}

export interface PaginaTornei {
  pagina: number;
  pagineTotali: number;
  tornei: TorneoCard[];
}

export interface MiaIscrizione {
  id: number;
  stato: StatoIscrizione;
  squadra: { id: number; nome: string } | null;
  posizioneAttesa: number | null;
}

export interface TorneoDettaglio {
  id: number;
  nome: string;
  descrizione: string | null;
  urlImmagine: string | null;
  gioco: { id: number; nome: string; tipologia: string };
  piattaforme: { id: number; nome: string }[];
  giocatoriPerSquadra: number;
  postiMax: number;
  iscritti: number;
  premio: string | null;
  aperturaIscrizioni: string;
  chiusuraIscrizioni: string;
  stato: StatoTorneo;
  organizzatore: { id: number; nickname: string };
  miaIscrizione: MiaIscrizione | null;
}

export interface RispostaIscrizione {
  id: number;
  idTorneo: number;
  stato: StatoIscrizione;
  squadra: { id: number; nome: string } | null;
  utente: { id: number; nickname: string } | null;
  dataIscrizione: string;
  posizioneAttesa: number | null;
}

export interface RispostaDisiscrizione {
  id: number;
  idTorneo: number;
  stato: 'ritirata';
  promossa: { id: number; nome: string; stato: StatoIscrizione } | null;
}
