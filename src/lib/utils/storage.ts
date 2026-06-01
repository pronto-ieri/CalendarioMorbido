// Risolve una chiave dello storage (es. "covers/abc.jpg") in URL pubblico.
// Il bucket "covers" è pubblico, quindi l'URL è costruibile senza chiamate.
export function coverUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/covers/${key}`;
}
