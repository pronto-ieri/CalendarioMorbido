// Single source of truth per le regioni — deve combaciare con il CHECK in 0001_init.sql
export const REGIONS = [
  "Valle d'Aosta",
  "Piemonte",
  "Lombardia",
  "Trentino-Alto Adige",
  "Veneto",
  "Friuli-Venezia Giulia",
  "Liguria",
  "Emilia-Romagna",
  "Toscana",
  "Umbria",
  "Marche",
  "Lazio",
  "Abruzzo",
  "Molise",
  "Campania",
  "Puglia",
  "Basilicata",
  "Calabria",
  "Sicilia",
  "Sardegna",
] as const;

export type Region = (typeof REGIONS)[number];
