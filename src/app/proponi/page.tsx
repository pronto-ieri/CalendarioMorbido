import { requireUser } from "@/lib/auth/require-user";
import ProposalForm from "@/components/proposals/ProposalForm";

export default async function ProponiPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-xl py-4">
      <h1 className="mb-1 font-head text-4xl font-bold leading-none">
        Proponi un evento
      </h1>
      <p className="mb-4 font-body text-ink-soft">
        La tua proposta sarà rivista dal gestore prima della pubblicazione.
      </p>
      <div className="card mb-4 bg-paper-soft p-3 font-body text-sm text-ink-soft">
        💡 Per le coordinate puoi cercare il luogo su una mappa e copiare
        latitudine e longitudine.
      </div>
      <ProposalForm userId={user.id} />
    </div>
  );
}
