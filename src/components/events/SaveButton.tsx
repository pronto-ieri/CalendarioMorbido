"use client";

import { useState, useTransition } from "react";
import { saveEvent, unsaveEvent } from "@/lib/actions/saved-events";
import { useToast } from "@/components/ui/Toast";

export default function SaveButton({
  eventId,
  initialSaved,
}: {
  eventId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  function toggle() {
    startTransition(async () => {
      const res = saved ? await unsaveEvent(eventId) : await saveEvent(eventId);
      if (res.error) {
        showToast(res.error, "error");
        return;
      }
      setSaved(!saved);
      showToast(
        saved ? "Rimosso dal tuo calendario" : "Salvato nel tuo calendario",
        "success",
      );
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`btn w-full ${saved ? "btn-ghost" : "btn-primary"} disabled:opacity-60`}
    >
      {pending
        ? "..."
        : saved
          ? "✓ Salvato nel mio calendario"
          : "Aggiungi al mio calendario"}
    </button>
  );
}
