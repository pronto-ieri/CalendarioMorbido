import type { Region } from "@/lib/constants/regions";

export type ProposalStatus = "pending" | "approved" | "rejected";

// Campi condivisi tra evento e proposta (il contenuto dell'evento).
export interface EventContent {
  title: string;
  description: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  region: Region;
  official_url: string | null;
  cover_image_key: string | null;
  start_comune: string;
  start_provincia: string;
  end_comune: string | null;
  end_provincia: string | null;
}

export interface EventRow extends EventContent {
  id: string;
  proposal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalRow extends EventContent {
  id: string;
  user_id: string;
  status: ProposalStatus;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface SavedEventRow {
  user_id: string;
  event_id: string;
  saved_at: string;
}
