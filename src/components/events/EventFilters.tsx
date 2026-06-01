"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { REGIONS } from "@/lib/constants/regions";

export default function EventFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const region = params.get("region") ?? "";
  const duration = params.get("duration") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/?${next.toString()}`);
  }

  const hasFilters = region || duration;

  return (
    <div className="card mb-4 p-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between font-head text-xl"
      >
        <span>Filtri{hasFilters ? " ·" : ""}</span>
        <span className="font-body text-sm text-ink-soft">
          {open ? "Nascondi ▲" : "Mostra ▼"}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          <div>
            <p className="field-label">Durata</p>
            <div className="flex flex-wrap gap-2">
              <button
                className={`chip ${duration === "" ? "chip-active" : ""}`}
                onClick={() => update("duration", "")}
              >
                Tutte
              </button>
              <button
                className={`chip ${duration === "single" ? "chip-active" : ""}`}
                onClick={() => update("duration", "single")}
              >
                Un giorno
              </button>
              <button
                className={`chip ${duration === "multi" ? "chip-active" : ""}`}
                onClick={() => update("duration", "multi")}
              >
                Più giorni
              </button>
            </div>
          </div>

          <div>
            <p className="field-label">Regione</p>
            <select
              className="field-input"
              value={region}
              onChange={(e) => update("region", e.target.value)}
            >
              <option value="">Tutte le regioni</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              className="font-body text-sm text-accent-deep underline"
              onClick={() => router.push("/")}
            >
              Azzera filtri
            </button>
          )}
        </div>
      )}
    </div>
  );
}
