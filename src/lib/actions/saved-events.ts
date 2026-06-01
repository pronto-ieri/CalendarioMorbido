"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Devi accedere per salvare un evento." };

  const { error } = await supabase
    .from("saved_events")
    .insert({ user_id: user.id, event_id: eventId });

  // 23505 = duplicato: già salvato, lo trattiamo come successo (idempotente).
  if (error && error.code !== "23505") return { error: error.message };

  revalidatePath(`/eventi/${eventId}`);
  revalidatePath("/calendario");
  return { ok: true };
}

export async function unsaveEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Devi accedere." };

  const { error } = await supabase
    .from("saved_events")
    .delete()
    .eq("user_id", user.id)
    .eq("event_id", eventId);

  if (error) return { error: error.message };

  revalidatePath(`/eventi/${eventId}`);
  revalidatePath("/calendario");
  return { ok: true };
}
