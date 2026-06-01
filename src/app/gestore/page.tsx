import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-user";
import AdminProposalCard from "@/components/admin/AdminProposalCard";
import StatusBadge from "@/components/proposals/StatusBadge";
import { formatDateRange } from "@/lib/utils/dates";
import type { ProposalRow, ProposalStatus } from "@/lib/types/db";

export const dynamic = "force-dynamic";

const TABS: { key: ProposalStatus; label: string }[] = [
  { key: "pending", label: "Da approvare" },
  { key: "approved", label: "Approvate" },
  { key: "rejected", label: "Rifiutate" },
];

export default async function GestorePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const active: ProposalStatus =
    status === "approved" || status === "rejected" ? status : "pending";

  const supabase = await createClient();
  const { data } = await supabase
    .from("proposals")
    .select("*")
    .eq("status", active)
    .order("submitted_at", { ascending: true });

  const proposals = (data ?? []) as ProposalRow[];

  return (
    <div className="space-y-4">
      <h1 className="font-head text-4xl font-bold leading-none">Area gestore</h1>
      <p className="font-body text-ink-soft">
        Richieste di pubblicazione eventi.
      </p>

      <div className="flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/gestore?status=${t.key}`}
            className={`-mb-px border-b-2 px-3 py-2 font-body ${
              active === t.key
                ? "border-accent-deep text-ink"
                : "border-transparent text-ink-soft"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {proposals.length === 0 ? (
        <p className="py-12 text-center font-body text-ink-soft">
          Nessuna proposta in questo stato.
        </p>
      ) : active === "pending" ? (
        <ul className="space-y-3">
          {proposals.map((p) => (
            <AdminProposalCard key={p.id} proposal={p} />
          ))}
        </ul>
      ) : (
        <ul className="space-y-2">
          {proposals.map((p) => (
            <li key={p.id} className="card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-head text-lg leading-tight">{p.title}</p>
                  <p className="font-body text-sm text-ink-soft">
                    {p.region} · {formatDateRange(p.start_date, p.end_date)}
                  </p>
                  {p.status === "rejected" && p.rejection_reason && (
                    <p className="mt-1 font-body text-sm text-red-700">
                      Motivo: {p.rejection_reason}
                    </p>
                  )}
                </div>
                <StatusBadge status={p.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
