"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { EventRow } from "@/lib/types/db";
import { isSingleDay, formatDateRange } from "@/lib/utils/dates";
import { formatRoute } from "@/lib/utils/location";
import EventCard from "@/components/events/EventCard";
import { BCP47, type Locale } from "@/i18n/config";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// "YYYY-MM-DD" da componenti locali (m è 0-indexed).
function ymd(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function occursOn(ev: EventRow, dayStr: string): boolean {
  return ev.start_date <= dayStr && dayStr <= ev.end_date;
}

type Cell = { date: Date; dayStr: string; inMonth: boolean };

// Posizionamento di un evento all'interno di una settimana (7 celle lun→dom).
type Segment = {
  event: EventRow;
  startIdx: number; // 0-6
  span: number;
  continuesLeft: boolean;
  continuesRight: boolean;
};

// Assegna i segmenti a corsie (lane) evitando sovrapposizioni di colonne.
function assignLanes(segments: Segment[]): Segment[][] {
  const lanes: { lastEnd: number; items: Segment[] }[] = [];
  for (const seg of segments) {
    let lane = lanes.find((l) => seg.startIdx > l.lastEnd);
    if (!lane) {
      lane = { lastEnd: -1, items: [] };
      lanes.push(lane);
    }
    lane.items.push(seg);
    lane.lastEnd = seg.startIdx + seg.span - 1;
  }
  return lanes.map((l) => l.items);
}

export default function EventCalendar({
  events,
  savedIds = [],
}: {
  events: EventRow[];
  savedIds?: string[];
}) {
  const saved = useMemo(() => new Set(savedIds), [savedIds]);
  const t = useTranslations("calendar");
  const locale = useLocale() as Locale;
  const weekdays = t.raw("weekdays") as string[];
  const monthFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(BCP47[locale], { month: "long", year: "numeric" }),
    [locale],
  );

  // Mese iniziale: quello del primo evento futuro, altrimenti il mese corrente.
  const today = new Date();
  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());
  const initial = useMemo(() => {
    const next = events.find((e) => e.end_date >= todayStr) ?? events[0];
    const ref = next ? new Date(next.start_date) : today;
    return { year: ref.getFullYear(), month: ref.getMonth() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [{ year, month }, setView] = useState(initial);
  const [selected, setSelected] = useState<string | null>(null);

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(null);
  }

  // Costruzione delle settimane (lun→dom).
  const weeks = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // lunedì = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const cells: Cell[] = [];
    for (let i = 0; i < totalCells; i++) {
      const date = new Date(year, month, 1 - startOffset + i);
      cells.push({
        date,
        dayStr: ymd(date.getFullYear(), date.getMonth(), date.getDate()),
        inMonth: date.getMonth() === month,
      });
    }
    const rows: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [year, month]);

  // Eventi che ricadono (anche parzialmente) nel mese visualizzato.
  const monthEvents = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthStart = ymd(year, month, 1);
    const monthEnd = ymd(year, month, daysInMonth);
    return events
      .filter((e) => e.start_date <= monthEnd && e.end_date >= monthStart)
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [events, year, month]);

  const monthLabel = monthFmt.format(new Date(year, month, 1));

  const selectedEvents = selected
    ? events.filter((e) => occursOn(e, selected))
    : [];

  return (
    <div className="space-y-3">
      {/* Header mese + navigazione */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => shiftMonth(-1)}
          className="chip"
          aria-label={t("prevMonth")}
        >
          ←
        </button>
        <h2 className="font-head text-2xl font-semibold capitalize">
          {monthLabel}
        </h2>
        <button
          onClick={() => shiftMonth(1)}
          className="chip"
          aria-label={t("nextMonth")}
        >
          →
        </button>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 font-body text-xs text-ink-soft">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />{" "}
          {t("oneDay")}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-6 rounded-full bg-accent-alt" />{" "}
          {t("multiDay")}
        </span>
        {savedIds.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="text-accent-deep">✓</span> {t("saved")}
          </span>
        )}
      </div>

      {/* Griglia calendario */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-line bg-paper-soft">
          {weekdays.map((w) => (
            <div
              key={w}
              className="py-1.5 text-center font-body text-xs text-ink-soft"
            >
              {w}
            </div>
          ))}
        </div>

        {weeks.map((cells, wi) => {
          const weekStart = cells[0].dayStr;
          const weekEnd = cells[6].dayStr;
          const segments: Segment[] = events
            .filter((e) => e.start_date <= weekEnd && e.end_date >= weekStart)
            .sort(
              (a, b) =>
                a.start_date.localeCompare(b.start_date) ||
                b.end_date.localeCompare(a.end_date),
            )
            .map((e) => {
              const f = cells.findIndex((c) => c.dayStr === e.start_date);
              const l = cells.findIndex((c) => c.dayStr === e.end_date);
              const startIdx = f === -1 ? 0 : f;
              const endIdx = l === -1 ? 6 : l;
              return {
                event: e,
                startIdx,
                span: endIdx - startIdx + 1,
                continuesLeft: e.start_date < weekStart,
                continuesRight: e.end_date > weekEnd,
              };
            });
          const lanes = assignLanes(segments);

          return (
            <div key={wi} className="border-b border-line last:border-b-0">
              {/* Numeri dei giorni */}
              <div className="grid grid-cols-7">
                {cells.map(({ date, dayStr, inMonth }) => {
                  const isToday = dayStr === todayStr;
                  const isSelected = dayStr === selected;
                  const hasEvents = events.some((e) => occursOn(e, dayStr));
                  return (
                    <button
                      key={dayStr}
                      onClick={() =>
                        setSelected(hasEvents && !isSelected ? dayStr : null)
                      }
                      className={`flex justify-center pt-1 ${
                        hasEvents ? "cursor-pointer" : "cursor-default"
                      } ${isSelected ? "bg-accent/10" : ""}`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full font-body text-sm ${
                          inMonth ? "" : "text-ink-soft/50"
                        } ${isToday ? "bg-ink text-paper" : ""}`}
                      >
                        {date.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Corsie con pallini (un giorno) e strisce (più giorni) */}
              <div className="min-h-[0.75rem] space-y-1 px-0.5 pb-1.5 pt-1">
                {lanes.map((lane, li) => (
                  <div key={li} className="grid grid-cols-7">
                    {lane.map((seg) => {
                      const single = isSingleDay(
                        seg.event.start_date,
                        seg.event.end_date,
                      );
                      const isSaved = saved.has(seg.event.id);
                      const color = single ? "bg-accent" : "bg-accent-alt";
                      const ring = isSaved ? "ring-1 ring-ink/50" : "";

                      if (single) {
                        // Pallino centrato nel giorno dell'evento.
                        return (
                          <Link
                            key={seg.event.id}
                            href={`/eventi/${seg.event.id}`}
                            title={seg.event.title}
                            aria-label={seg.event.title}
                            style={{ gridColumn: `${seg.startIdx + 1} / span 1` }}
                            className="flex items-center justify-center hover:brightness-95"
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${color} ${ring}`}
                            />
                          </Link>
                        );
                      }

                      // Striscia centrata sui giorni: il corpo dritto termina al
                      // centro del giorno d'inizio/fine (sotto il numero) e il
                      // semicerchio parte da lì estendendosi verso l'esterno di un
                      // raggio (= metà altezza della striscia). Dove l'evento
                      // prosegue nella settimana adiacente l'estremo è piatto e a
                      // filo del bordo della cella (continuazione).
                      // Mezza cella = 100/(2*span) % della larghezza del segmento;
                      // sottraggo il raggio del cappuccio per allungare la pillola.
                      const cap = "0.3125rem"; // raggio = h-2.5 / 2
                      const half = `calc(${100 / (2 * seg.span)}% - ${cap})`;
                      return (
                        <Link
                          key={seg.event.id}
                          href={`/eventi/${seg.event.id}`}
                          title={seg.event.title}
                          aria-label={seg.event.title}
                          style={{
                            gridColumn: `${seg.startIdx + 1} / span ${seg.span}`,
                          }}
                          className="flex items-center hover:brightness-95"
                        >
                          <span
                            style={{
                              marginLeft: seg.continuesLeft ? 0 : half,
                              marginRight: seg.continuesRight ? 0 : half,
                            }}
                            className={`h-2.5 flex-1 ${color} ${ring} ${
                              seg.continuesLeft ? "" : "rounded-l-full"
                            } ${seg.continuesRight ? "" : "rounded-r-full"}`}
                          />
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card del mese a scorrimento orizzontale */}
      {events.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-head text-lg font-semibold capitalize">
            {t("eventsOf", { month: monthLabel })}
          </h3>
          {monthEvents.length > 0 ? (
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-0.5 pb-2 pt-1">
              {monthEvents.map((e) => (
                <div key={e.id} className="w-64 shrink-0 snap-start sm:w-72">
                  <EventCard event={e} saved={saved.has(e.id)} />
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-ink-soft">
              {t("noEventsMonth")}
            </p>
          )}
        </div>
      )}

      {/* Dettaglio giorno selezionato */}
      {selected && selectedEvents.length > 0 && (
        <ul className="space-y-2">
          {selectedEvents.map((e) => (
            <li key={e.id}>
              <Link
                href={`/eventi/${e.id}`}
                className="card flex items-center gap-3 p-3 hover:bg-paper-soft"
              >
                <span
                  className={`inline-block h-3 w-3 shrink-0 rounded-full ${
                    isSingleDay(e.start_date, e.end_date)
                      ? "bg-accent"
                      : "bg-accent-alt"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-head text-lg leading-tight">
                    {e.title}
                    {saved.has(e.id) && (
                      <span
                        className="ml-1 text-accent-deep"
                        title={t("savedTitle")}
                      >
                        ✓
                      </span>
                    )}
                  </span>
                  <span className="block font-body text-sm text-ink-soft">
                    {formatDateRange(e.start_date, e.end_date, locale)} ·{" "}
                    {formatRoute(e)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {events.length === 0 && (
        <p className="py-8 text-center font-body text-ink-soft">
          {t("noEventsFilters")}
        </p>
      )}
    </div>
  );
}
