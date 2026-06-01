"use client";

import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { REGIONS } from "@/lib/constants/regions";
import { submitProposal } from "@/lib/actions/proposals";

export default function ProposalForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(submitProposal, undefined);
  const [coverKey, setCoverKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const key = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("covers")
        .upload(key, file, { upsert: false });
      if (error) throw error;
      setCoverKey(key);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Errore durante il caricamento.",
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
        <div>
          <label className="field-label" htmlFor="start_location_name">
            Luogo di partenza
          </label>
          <input
            id="start_location_name"
            name="start_location_name"
            required
            className="field-input"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="start_lat">
              Latitudine
            </label>
            <input
              id="start_lat"
              name="start_lat"
              type="number"
              step="any"
              required
              placeholder="43.7696"
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="start_lng">
              Longitudine
            </label>
            <input
              id="start_lng"
              name="start_lng"
              type="number"
              step="any"
              required
              placeholder="11.2558"
              className="field-input"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="card space-y-3 p-3">
        <legend className="px-1 font-head text-lg">Arrivo (opzionale)</legend>
        <div>
          <label className="field-label" htmlFor="end_location_name">
            Luogo di arrivo
          </label>
          <input
            id="end_location_name"
            name="end_location_name"
            className="field-input"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="end_lat">
              Latitudine
            </label>
            <input
              id="end_lat"
              name="end_lat"
              type="number"
              step="any"
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="end_lng">
              Longitudine
            </label>
            <input
              id="end_lng"
              name="end_lng"
              type="number"
              step="any"
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
        {uploadError && (
          <p className="mt-1 font-body text-sm text-red-700">{uploadError}</p>
        )}
      </div>

      {state?.error && (
        <p className="font-body text-sm text-red-700">{state.error}</p>
      )}

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
