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

// ---- area admin ----

// corpo di post /api/tornei; in put /api/tornei/{id} si mandano solo i campi cambiati
export interface DatiTorneo {
  nome: string;
  idGioco: number;
  idPiattaforme: number[];
  premio: string | null;
  aperturaIscrizioni: string;
  chiusuraIscrizioni: string;
  giocatoriPerSquadra: number;
  postiMax: number;
  descrizione: string | null;
}

export interface TorneoCreato {
  id: number;
  nome: string;
  stato: StatoTorneo;
  gioco: { id: number; nome: string; tipologia: string };
  piattaforme: { id: number; nome: string }[];
  giocatoriPerSquadra: number;
  postiMax: number;
  premio: string | null;
  aperturaIscrizioni: string;
  chiusuraIscrizioni: string;
  urlImmagine: string | null;
}

export interface RispostaStato {
  id: number;
  stato: StatoTorneo;
}

export interface RispostaImmagine {
  id: number;
  urlImmagine: string;
}

export interface IscrizioneAdmin {
  id: number;
  nome: string;
  tipo: 'squadra' | 'utente';
  dataIscrizione: string;
  stato: StatoIscrizione;
  posizioneAttesa: number | null;
}

export interface PaginaIscrizioni {
  pagina: number;
  pagineTotali: number;
  iscrizioni: IscrizioneAdmin[];
}

export interface RispostaConferma {
  id: number;
  idTorneo: number;
  stato: StatoIscrizione;
}

export interface RispostaTabellone {
  idTorneo: number;
  round: number;
  partiteCreate: number;
  partite: { id: number; iscrizioneA: number; iscrizioneB: number | null }[];
}


export type StatoPartita = 'programmata' | 'in_corso' | 'conclusa';

export interface Partecipante {
  idIscrizione: number;
  nome: string;
}

export interface Partita {
  id: number;
  stato: StatoPartita;
  dataPartita: string | null;
  partecipanteA: Partecipante | null;
  punteggioA: number | null;
  partecipanteB: Partecipante | null;
  punteggioB: number | null;
  vincitore: number | null;
}

export interface Turno {
  round: number;
  partite: Partita[];
}

export interface Tabellone {
  idTorneo: number;
  turni: Turno[];
}

export interface RispostaRisultato {
  id: number;
  stato: StatoPartita;
  punteggioA: number;
  punteggioB: number;
  vincitore: Partecipante;
  prossimaPartita: number | null;
}

// get e put /api/configurazione/limite-iscrizioni
export interface LimiteIscrizioni {
  maxTorneiPerUtente: number;
}

export interface LimiteAggiornato extends LimiteIscrizioni {
  dataModifica: string;
}
