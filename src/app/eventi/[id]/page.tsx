import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StaticMapBox from "@/components/events/StaticMapBox";
import SaveButton from "@/components/events/SaveButton";
import { coverUrl } from "@/lib/utils/storage";
import { formatDateRange, durationLabel } from "@/lib/utils/dates";
import type { EventRow } from "@/lib/types/db";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!event) notFound();
  const ev = event as EventRow;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let saved = false;
  if (user) {
    const { data: savedRow } = await supabase
      .from("saved_events")
      .select("event_id")
      .eq("user_id", user.id)
      .eq("event_id", id)
      .maybeSingle();
    saved = !!savedRow;
  }

  const cover = coverUrl(ev.cover_image_key);

  return (
    <article className="space-y-4 pb-24">
      <Link href="/" className="font-body text-sm text-accent-deep">
        ← Torna al calendario
      </Link>

      <div className="card overflow-hidden">
        <div className="relative aspect-[16/9] w-full bg-paper-soft">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={ev.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--paper),var(--paper)_14px,var(--paper-soft)_14px,var(--paper-soft)_28px)]">
              <span className="font-head text-5xl text-ink-soft">🚲</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <span className="chip mb-2">
            {durationLabel(ev.start_date, ev.end_date)}
          </span>
          <h1 className="font-head text-4xl font-bold leading-none">{ev.title}</h1>
          <p className="mt-1 font-body text-accent-deep">
            📅 {formatDateRange(ev.start_date, ev.end_date)}
          </p>
          <p className="font-body text-ink-soft">📍 {ev.region}</p>
        </div>
      </div>

      {ev.description && (
        <div className="card p-4">
          <h2 className="mb-1 font-head text-2xl">Descrizione</h2>
          <p className="font-body">{ev.description}</p>
        </div>
      )}

      <div>
        <h2 className="mb-2 font-head text-2xl">Percorso</h2>
        <StaticMapBox
          start={{
            name: ev.start_location_name,
            lat: ev.start_lat,
            lng: ev.start_lng,
          }}
          end={
            ev.end_location_name && ev.end_lat != null && ev.end_lng != null
              ? { name: ev.end_location_name, lat: ev.end_lat, lng: ev.end_lng }
              : null
          }
        />
      </div>

      {ev.official_url && (
        <a
          href={ev.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="card flex items-center justify-between p-4 font-body hover:bg-paper-soft"
        >
          <span>🔗 Sito ufficiale dell&apos;evento</span>
          <span className="text-accent-deep">Apri →</span>
        </a>
      )}

      {/* CTA sticky in basso */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 p-3 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-1">
          {user ? (
            <SaveButton eventId={ev.id} initialSaved={saved} />
          ) : (
            <Link href="/accedi" className="btn btn-primary w-full">
              Accedi per salvare l&apos;evento
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
