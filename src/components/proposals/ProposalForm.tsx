"use client";

import { useActionState, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { REGIONS } from "@/lib/constants/regions";
import { submitProposal } from "@/lib/actions/proposals";
import { useToast } from "@/components/ui/Toast";

export default function ProposalForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(submitProposal, undefined);
  const [coverKey, setCoverKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  // L'invio riuscito reindirizza lato server; qui mostriamo gli errori via toast.
  useEffect(() => {
    if (state?.error) showToast(state.error, "error");
  }, [state, showToast]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const key = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("covers")
        .upload(key, file, { upsert: false });
      if (error) throw error;
      setCoverKey(key);
      showToast("Immagine caricata", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Errore durante il caricamento.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="cover_image_key" value={coverKey} />

      <div>
        <label className="field-label" htmlFor="title">
          Nome evento *
        </label>
        <input id="title" name="title" required className="field-input" />
      </div>

      <div>
        <label className="field-label" htmlFor="description">
          Descrizione
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="field-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="start_date">
            Data inizio *
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="end_date">
            Data fine *
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            required
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="region">
          Regione *
        </label>
        <select id="region" name="region" required className="field-input" defaultValue="">
          <option value="" disabled>
            Seleziona…
          </option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="card space-y-3 p-3">
        <legend className="px-1 font-head text-lg">Partenza *</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="start_comune">
              Comune
            </label>
            <input
              id="start_comune"
              name="start_comune"
              required
              placeholder="Firenze"
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="start_provincia">
              Provincia
            </label>
            <input
              id="start_provincia"
              name="start_provincia"
              required
              placeholder="Firenze"
              className="field-input"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="card space-y-3 p-3">
        <legend className="px-1 font-head text-lg">Arrivo (opzionale)</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="end_comune">
              Comune
            </label>
            <input
              id="end_comune"
              name="end_comune"
              placeholder="Siena"
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="end_provincia">
              Provincia
            </label>
            <input
              id="end_provincia"
              name="end_provincia"
              placeholder="Siena"
              className="field-input"
            />
          </div>
        </div>
      </fieldset>

      <div>
        <label className="field-label" htmlFor="official_url">
          Link ufficiale
        </label>
        <input
          id="official_url"
          name="official_url"
          type="url"
          placeholder="https://…"
          className="field-input"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="cover">
          Immagine di copertina
        </label>
        <input
          id="cover"
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="field-input"
        />
        {uploading && (
          <p className="mt-1 font-body text-sm text-ink-soft">Caricamento…</p>
        )}
        {coverKey && !uploading && (
          <p className="mt-1 font-body text-sm text-accent-deep">
            ✓ Immagine caricata
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending || uploading}
        className="btn btn-primary w-full disabled:opacity-60"
      >
        {pending ? "Invio…" : "Invia proposta"}
      </button>
    </form>
  );
}
