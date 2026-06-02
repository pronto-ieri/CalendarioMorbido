"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { EventRow } from "@/lib/types/db";
import { isSingleDay, formatDateRange } from "@/lib/utils/dates";
import { formatRoute } from "@/lib/utils/location";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

const MONTH_FMT = new Intl.DateTimeFormat("it-IT", {
  month: "long",
  year: "numeric",
});

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

export default function EventCalendar({
  events,
  savedIds = [],
}: {
  events: EventRow[];
  savedIds?: string[];
}) {
  const saved = useMemo(() => new Set(savedIds), [savedIds]);

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

  // Costruzione della griglia (settimane lun→dom).
  const weeks = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // lunedì = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const cells: { date: Date; dayStr: string; inMonth: boolean }[] = [];
    for (let i = 0; i < totalCells; i++) {
      const date = new Date(year, month, 1 - startOffset + i);
      cells.push({
        date,
        dayStr: ymd(date.getFullYear(), date.getMonth(), date.getDate()),
        inMonth: date.getMonth() === month,
      });
    }
    const rows: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [year, month]);

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
          aria-label="Mese precedente"
        >
          ←
        </button>
        <h2 className="font-head text-2xl font-semibold capitalize">
          {MONTH_FMT.format(new Date(year, month, 1))}
        </h2>
        <button
          onClick={() => shiftMonth(1)}
          className="chip"
          aria-label="Mese successivo"
        >
          →
        </button>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 font-body text-xs text-ink-soft">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-accent" /> Un
          giorno
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-accent-alt" />{" "}
          Più giorni
        </span>
        {savedIds.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-paper ring-2 ring-ink" />{" "}
            Salvato
          </span>
        )}
      </div>

      {/* Griglia */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-line bg-paper-soft">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="py-1.5 text-center font-body text-xs text-ink-soft"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map(({ date, dayStr, inMonth }) => {
            const dayEvents = events.filter((e) => occursOn(e, dayStr));
            const isToday = dayStr === todayStr;
            const isSelected = dayStr === selected;
            return (
              <button
                key={dayStr}
                onClick={() =>
                  setSelected(
                    dayEvents.length ? (isSelected ? null : dayStr) : null,
                  )
                }
                className={`flex min-h-[3.5rem] flex-col items-center gap-1 border-b border-r border-line p-1 text-center transition-colors last:border-r-0 sm:min-h-[4.5rem] ${
                  inMonth ? "" : "bg-paper-soft/40 text-ink-soft"
                } ${isSelected ? "bg-accent/10" : ""} ${
                  dayEvents.length ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full font-body text-sm ${
                    isToday ? "bg-ink text-paper" : ""
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="flex flex-wrap items-center justify-center gap-0.5">
                    {dayEvents.slice(0, 4).map((e) => (
                      <span
                        key={e.id}
                        className={`inline-block h-2 w-2 rounded-full ${
                          isSingleDay(e.start_date, e.end_date)
                            ? "bg-accent"
                            : "bg-accent-alt"
                        } ${saved.has(e.id) ? "ring-1 ring-ink" : ""}`}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

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
                  className={`mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full ${
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
                        title="Salvato nel tuo calendario"
                      >
                        ✓
                      </span>
                    )}
                  </span>
                  <span className="block font-body text-sm text-ink-soft">
                    {formatDateRange(e.start_date, e.end_date)} · {formatRoute(e)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {events.length === 0 && (
        <p className="py-8 text-center font-body text-ink-soft">
          Nessun evento trovato con questi filtri.
        </p>
      )}
    </div>
  );
}
