"use client";

import { useState, useTransition } from "react";
import { deleteEvent } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/Toast";

export default function DeleteEventButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const { showToast } = useToast();

  function remove() {
    startTransition(async () => {
      // In caso di successo l'action reindirizza a "/"; qui gestiamo solo l'errore.
      const res = await deleteEvent(eventId);
      if (res?.error) {
        showToast("Impossibile eliminare l'evento.", "error");
        setConfirming(false);
      }
    });
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="btn btn-ghost w-full border-red-300 text-red-700 hover:bg-red-50"
      >
        🗑️ Elimina evento
      </button>
    );
  }

  return (
    <div className="card space-y-3 border-red-300 p-4">
      <p className="font-body text-sm text-red-800">
        Eliminare questo evento? Sparirà anche dai calendari personali degli
        utenti. L&apos;azione è irreversibile.
      </p>
      <div className="flex gap-2">
        <button
          onClick={remove}
          disabled={pending}
          className="btn w-full bg-red-600 text-white hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Eliminazione…" : "Conferma eliminazione"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="btn btn-ghost"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}
