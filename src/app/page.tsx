import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EventGrid from "@/components/events/EventGrid";
import EventFilters from "@/components/events/EventFilters";
import { isSingleDay } from "@/lib/utils/dates";
import type { EventRow } from "@/lib/types/db";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; duration?: string }>;
}) {
  const { region, duration } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });

  if (region) query = query.eq("region", region);

  const { data, error } = await query;
  let events = (data ?? []) as EventRow[];

  // Filtro durata applicato lato server (dataset piccolo).
  if (duration === "single") {
    events = events.filter((e) => isSingleDay(e.start_date, e.end_date));
  } else if (duration === "multi") {
    events = events.filter((e) => !isSingleDay(e.start_date, e.end_date));
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="font-head text-4xl font-bold leading-none">
            Calendario pubblico
          </h1>
          <p className="font-body text-ink-soft">
            Pedalate cicloturistiche non competitive in Italia
          </p>
        </div>
        <Link href="/mappa" className="chip whitespace-nowrap">
          🗺️ Mappa
        </Link>
      </div>

      <EventFilters />

      {error ? (
        <p className="card p-4 font-body text-red-700">
          Errore nel caricamento degli eventi. Hai configurato Supabase? ({error.message})
        </p>
      ) : (
        <EventGrid events={events} />
      )}
    </div>
  );
}
