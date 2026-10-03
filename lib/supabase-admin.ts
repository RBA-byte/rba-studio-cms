import { createClient } from "@supabase/supabase-js";
// Server-only client for the public share links (bypasses login). Never import in client components.
export const adminClient = () => createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
