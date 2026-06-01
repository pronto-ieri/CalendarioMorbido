interface Point {
  name: string;
  lat: number | string;
  lng: number | string;
}

// Placeholder mappa (MVP): mostra partenza/arrivo e coordinate.
// Da sostituire con MapLibre GL + MapTiler in una fase successiva.
export default function StaticMapBox({
  start,
  end,
}: {
  start: Point;
  end?: Point | null;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="relative flex h-40 items-center justify-center bg-[repeating-linear-gradient(45deg,var(--paper),var(--paper)_16px,var(--paper-soft)_16px,var(--paper-soft)_32px)]">
        <span className="font-head text-xl text-ink-soft">
          🗺️ Mappa in arrivo
        </span>
      </div>
      <div className="space-y-2 p-3 font-body text-sm">
        <div className="flex items-start gap-2">
          <span>🟢</span>
          <div>
            <p className="font-medium">{start.name}</p>
            <p className="text-ink-soft">
              {Number(start.lat).toFixed(4)}, {Number(start.lng).toFixed(4)}
            </p>
          </div>
        </div>
        {end && (
          <div className="flex items-start gap-2">
            <span>🏁</span>
            <div>
              <p className="font-medium">{end.name}</p>
              <p className="text-ink-soft">
                {Number(end.lat).toFixed(4)}, {Number(end.lng).toFixed(4)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
