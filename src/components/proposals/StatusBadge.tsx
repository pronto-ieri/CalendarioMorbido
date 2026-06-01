import type { ProposalStatus } from "@/lib/types/db";

const LABELS: Record<ProposalStatus, string> = {
  pending: "In sospeso",
  approved: "Approvato",
  rejected: "Rifiutato",
};

const STYLES: Record<ProposalStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-[var(--accent)] text-ink",
  rejected: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
