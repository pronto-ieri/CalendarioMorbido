import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateRange } from "@/lib/utils/dates";
import type { EventMapMarker } from "@/lib/types/db";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, start_date, end_date, region, start_lat, start_lng")
    .order("start_date", { ascending: true });

  const markers = (data ?? []) as EventMapMarker[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-head text-4xl font-bold leading-none">Vista mappa</h1>
        {/* Toggle Lista / Mappa */}
        <div className="flex rounded-full border border-line p-0.5">
          <Link href="/" className="rounded-full px-3 py-1 font-body text-sm">
            Lista
          </Link>
          <span className="rounded-full bg-accent px-3 py-1 font-body text-sm">
            Mappa
          </span>
        </div>
      </div>

      <div className="card relative flex h-64 items-center justify-center overflow-hidden bg-[repeating-linear-gradient(45deg,var(--paper),var(--paper)_18px,var(--paper-soft)_18px,var(--paper-soft)_36px)]">
        <div className="text-center font-body text-ink-soft">
          <p className="font-head text-2xl">🗺️ Mappa interattiva in arrivo</p>
          <p className="text-sm">
            Placeholder MVP · {markers.length} eventi geolocalizzati
          </p>
        </div>
      </div>

      <p className="font-body text-sm text-ink-soft">
        Eventi sulla mappa (partenza):
      </p>
      <ul className="space-y-2">
        {markers.map((m, i) => (
          <li key={m.id}>
            <Link
              href={`/eventi/${m.id}`}
              className="card flex items-center gap-3 p-3 hover:bg-paper-soft"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-body text-sm font-medium">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate font-head text-lg leading-tight">
                  {m.title}
                </p>
                <p className="font-body text-sm text-ink-soft">
                  {m.region} · {formatDateRange(m.start_date, m.end_date)} ·{" "}
                  {Number(m.start_lat).toFixed(3)}, {Number(m.start_lng).toFixed(3)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
