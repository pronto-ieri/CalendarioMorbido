import type { EventRow } from "@/lib/types/db";
import EventCard from "./EventCard";

export default function EventGrid({ events }: { events: EventRow[] }) {
  if (events.length === 0) {
    return (
      <p className="py-12 text-center font-body text-ink-soft">
        Nessun evento trovato con questi filtri.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
