import Link from "next/link";
import type { EventRow } from "@/lib/types/db";
import { formatDateRange, durationLabel } from "@/lib/utils/dates";
import { formatRoute } from "@/lib/utils/location";
import { coverUrl } from "@/lib/utils/storage";

export default function EventCard({ event }: { event: EventRow }) {
  const url = coverUrl(event.cover_image_key);

  return (
    <Link href={`/eventi/${event.id}`} className="card group overflow-hidden">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper-soft">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={event.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--paper),var(--paper)_12px,var(--paper-soft)_12px,var(--paper-soft)_24px)]">
            <span className="font-head text-3xl text-ink-soft">🚲</span>
          </div>
        )}
        <span className="chip absolute left-2 top-2 bg-paper/90 text-xs">
          {durationLabel(event.start_date, event.end_date)}
        </span>
      </div>
      <div className="p-3">
        <p className="font-body text-sm text-accent-deep">
          {formatDateRange(event.start_date, event.end_date)}
        </p>
        <h3 className="font-head text-xl font-semibold leading-tight">
          {event.title}
        </h3>
        <p className="mt-1 font-body text-sm text-ink-soft">
          📍 {formatRoute(event)} · {event.region}
        </p>
      </div>
    </Link>
  );
}
