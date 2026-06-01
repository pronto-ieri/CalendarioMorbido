import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import EventGrid from "@/components/events/EventGrid";
import StatusBadge from "@/components/proposals/StatusBadge";
import { formatDateRange } from "@/lib/utils/dates";
import type { EventRow, ProposalRow } from "@/lib/types/db";

export const dynamic = "force-dynamic";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const { tab } = await searchParams;
  const activeTab = tab === "proposte" ? "proposte" : "salvati";

  const supabase = await createClient();

  const { data: savedData } = await supabase
    .from("saved_events")
    .select("saved_at, event:events(*)")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  const savedEvents = (savedData ?? [])
    .map((r) => r.event as unknown as EventRow)
    .filter(Boolean);

  const { data: proposalsData } = await supabase
    .from("proposals")
    .select("*")
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false });

  const proposals = (proposalsData ?? []) as ProposalRow[];

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="font-head text-4xl font-bold leading-none">
          Il mio calendario
        </h1>
        <Link href="/proponi" className="chip chip-active whitespace-nowrap">
          + Proponi
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-line">
        <Link
          href="/calendario?tab=salvati"
          className={`-mb-px border-b-2 px-3 py-2 font-body ${
            activeTab === "salvati"
              ? "border-accent-deep text-ink"
              : "border-transparent text-ink-soft"
          }`}
        >
          Salvati ({savedEvents.length})
        </Link>
        <Link
          href="/calendario?tab=proposte"
          className={`-mb-px border-b-2 px-3 py-2 font-body ${
            activeTab === "proposte"
              ? "border-accent-deep text-ink"
              : "border-transparent text-ink-soft"
          }`}
        >
          Le mie proposte ({proposals.length})
        </Link>
      </div>

      {activeTab === "salvati" ? (
        savedEvents.length > 0 ? (
          <EventGrid events={savedEvents} />
        ) : (
          <p className="py-12 text-center font-body text-ink-soft">
            Non hai ancora salvato eventi.{" "}
            <Link href="/" className="text-accent-deep underline">
              Esplora il calendario
            </Link>
          </p>
        )
      ) : proposals.length > 0 ? (
        <ul className="space-y-2">
          {proposals.map((p) => (
            <li key={p.id} className="card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-head text-lg leading-tight">{p.title}</p>
                  <p className="font-body text-sm text-ink-soft">
                    {p.region} · {formatDateRange(p.start_date, p.end_date)}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              {p.status === "rejected" && p.rejection_reason && (
                <p className="mt-2 font-body text-sm text-red-700">
                  Motivo: {p.rejection_reason}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-12 text-center font-body text-ink-soft">
          Non hai ancora proposto eventi.{" "}
          <Link href="/proponi" className="text-accent-deep underline">
            Proponi il primo
          </Link>
        </p>
      )}
    </div>
  );
}
