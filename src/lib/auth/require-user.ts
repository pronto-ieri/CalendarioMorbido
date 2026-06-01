import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

// Ritorna l'utente loggato oppure null (no redirect).
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Richiede un utente loggato, altrimenti reindirizza a /accedi.
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/accedi");
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_admin");
  return data === true;
}

// Richiede un amministratore, altrimenti reindirizza.
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (!(await isAdmin())) redirect("/");
  return user;
}
