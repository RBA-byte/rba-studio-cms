import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./supabase";
import { BRAND } from "./brand";
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Settings = { crewRate: number; albumRate: number; outdoorCost: number; brand: typeof BRAND };
export const DEFAULTS: Settings = { crewRate: 10000, albumRate: 10000, outdoorCost: 15000, brand: BRAND };
// Falls back to defaults if the settings table is missing or empty.
export async function getSettings(client?: SupabaseClient): Promise<Settings> {
  try {
    const sb = client ?? await createClient(), { data } = await sb.from("settings").select("data").eq("id", 1).maybeSingle(), d: any = data?.data ?? {};
    return { crewRate: Number(d.crewRate) || DEFAULTS.crewRate, albumRate: Number(d.albumRate) || DEFAULTS.albumRate, outdoorCost: Number(d.outdoorCost) || DEFAULTS.outdoorCost, brand: { ...BRAND, ...(d.brand ?? {}) } };
  } catch { return DEFAULTS; }
}
