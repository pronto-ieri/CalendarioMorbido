"use client";

import { useState, useTransition } from "react";
import { saveEvent, unsaveEvent } from "@/lib/actions/saved-events";

export default function SaveButton({
  eventId,
  initialSaved,
}: {
  eventId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const res = saved ? await unsaveEvent(eventId) : await saveEvent(eventId);
      if (!res.error) setSaved(!saved);
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
