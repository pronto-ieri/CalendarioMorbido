import type { EventContent } from "@/lib/types/db";

// "Firenze (Firenze)" oppure solo "Firenze" se la provincia manca o è il
// placeholder "—" (usato dalla migration per i dati storici senza provincia).
export function formatPlace(
  comune: string,
  provincia: string | null,
): string {
  const prov = provincia?.trim();
  return prov && prov !== "—" ? `${comune} (${prov})` : comune;
}

// "Firenze (Firenze) → Siena (Siena)" oppure solo la partenza se non c'è arrivo.
export function formatRoute(
  ev: Pick<
    EventContent,
    "start_comune" | "start_provincia" | "end_comune" | "end_provincia"
  >,
): string {
  const start = formatPlace(ev.start_comune, ev.start_provincia);
  if (ev.end_comune) {
    return `${start} → ${formatPlace(ev.end_comune, ev.end_provincia)}`;
  }
  return start;
}
