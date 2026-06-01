const FMT = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const FMT_SHORT = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
});

// Le date arrivano come "YYYY-MM-DD"; le interpretiamo come date locali (no UTC shift).
function parse(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function isSingleDay(start: string, end: string): boolean {
  return start === end;
}

export function formatItalianDate(dateStr: string): string {
  return FMT.format(parse(dateStr));
}

// Es. "12 set 2026" oppure "12 – 14 set 2026" / "12 set – 3 ott 2026"
export function formatDateRange(start: string, end: string): string {
  if (isSingleDay(start, end)) return formatItalianDate(start);
  const s = parse(start);
  const e = parse(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} – ${formatItalianDate(end)}`;
  }
  return `${FMT_SHORT.format(s)} – ${formatItalianDate(end)}`;
}

export function durationLabel(start: string, end: string): string {
  return isSingleDay(start, end) ? "Un giorno" : "Più giorni";
}
