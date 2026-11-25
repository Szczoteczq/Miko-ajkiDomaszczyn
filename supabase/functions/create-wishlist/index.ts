import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json, sha256, validUrl } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Niedozwolona metoda." }, 405);
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const gift = String(body.gift ?? "").trim();
    const url = String(body.url ?? "").trim();
    const notes = String(body.notes ?? "").trim();
    if (!name || name.length > 60 || !gift || gift.length > 180 || notes.length > 500 || !validUrl(url)) {
      return json({ error: "Sprawdź formularz. Imię, prezent lub link mają nieprawidłową wartość." }, 400);
    }
    const token = crypto.randomUUID() + crypto.randomUUID();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await supabase.from("wishlists").insert({
      name, gift, url: url || null, notes: notes || null, edit_token_hash: await sha256(token)
    });
    if (error) throw error;
    return json({ token });
  } catch (e) {
    console.error(e);
    return json({ error: "Nie udało się dodać życzenia." }, 500);
  }
});