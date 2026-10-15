import { StatoIscrizione, StatoTorneo } from '../../models/torneo';

export const TESTI_STATO_TORNEO: Record<StatoTorneo, string> = {
  bozza: 'Bozza',
  iscrizioni_aperte: 'Iscrizioni aperte',
  iscrizioni_chiuse: 'Iscrizioni chiuse',
  in_corso: 'In corso',
  concluso: 'Concluso',
  annullato: 'Cancellato'
};

export const elencoAdmin = {
  pagina: 1,
  stato: null as StatoTorneo | null,
  ricerca: '',
  idTipologia: null as number | null,
  nomeGioco: null as string | null,
  nomePiattaforma: null as string | null,
  formato: null as number | null
};

export const TESTI_STATO_ISCRIZIONE: Record<StatoIscrizione, string> = {
  lista_attesa: "Lista d'attesa",
  in_attesa: 'Da confermare',
  confermata: 'Confermata',
  ritirata: 'Ritirata'
};

// "2026-10-15T00:00:00" -> "2026-10-15T00:00" per i campi datetime-local
export function perCampoData(iso: string): string {
  return iso ? iso.slice(0, 16) : '';
}

// "2026-10-15T00:00" -> "2026-10-15T00:00:00" come vuole il contratto
export function daCampoData(valore: string): string {
  return valore.length === 16 ? `${valore}:00` : valore;
}
