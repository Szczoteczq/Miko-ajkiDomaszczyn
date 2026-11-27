import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "Niedozwolona metoda." }, 405);
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await supabase.from("wishlists")
      .select("id,name,gift,url,notes,created_at,updated_at")
      .is("hidden_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return json({ items: data ?? [] });
  } catch (e) {
    console.error(e);
    return json({ error: "Nie udało się pobrać listy." }, 500);
  }
});