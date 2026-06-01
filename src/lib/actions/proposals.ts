"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { REGIONS, type Region } from "@/lib/constants/regions";

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}
function optStr(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v === "" ? null : v;
}
function optNum(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  return v === "" ? null : Number(v);
}

export async function submitProposal(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Devi accedere per proporre un evento." };

  const region = str(formData, "region");
  if (!REGIONS.includes(region as Region))
    return { error: "Seleziona una regione valida." };

  const startDate = str(formData, "start_date");
  const endDate = str(formData, "end_date");
  if (!startDate || !endDate) return { error: "Le date sono obbligatorie." };
  if (endDate < startDate)
    return { error: "La data di fine non può precedere quella di inizio." };

  const startLat = optNum(formData, "start_lat");
  const startLng = optNum(formData, "start_lng");
  if (startLat == null || startLng == null)
    return { error: "Le coordinate di partenza sono obbligatorie." };

  const payload = {
    user_id: user.id,
    status: "pending" as const,
    title: str(formData, "title"),
    description: optStr(formData, "description"),
    start_date: startDate,
    end_date: endDate,
    region,
    official_url: optStr(formData, "official_url"),
    cover_image_key: optStr(formData, "cover_image_key"),
    start_location_name: str(formData, "start_location_name"),
    start_lat: startLat,
    start_lng: startLng,
    end_location_name: optStr(formData, "end_location_name"),
    end_lat: optNum(formData, "end_lat"),
    end_lng: optNum(formData, "end_lng"),
  };

  if (!payload.title || !payload.start_location_name)
    return { error: "Titolo e luogo di partenza sono obbligatori." };

  const { error } = await supabase.from("proposals").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/calendario");
  redirect("/calendario?tab=proposte");
}
