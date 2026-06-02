"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveProposal(proposalId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_proposal", {
    p_proposal_id: proposalId,
  });
  if (error) return { error: error.message };

  revalidatePath("/gestore");
  revalidatePath("/");
  return { ok: true };
}

export async function rejectProposal(proposalId: string, reason: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposals")
    .update({
      status: "rejected",
      rejection_reason: reason || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", proposalId)
    .eq("status", "pending");
  if (error) return { error: error.message };

  revalidatePath("/gestore");
  return { ok: true };
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_event", {
    p_event_id: eventId,
  });
  if (error) return { error: error.message };

  // La FK saved_events.event_id è ON DELETE CASCADE: l'evento sparisce anche
  // dai calendari personali. Rinfreschiamo home e calendari salvati.
  revalidatePath("/");
  revalidatePath("/calendario");
  redirect("/");
}
