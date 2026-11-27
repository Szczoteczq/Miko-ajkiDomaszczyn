import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json, sha256, validUrl } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Niedozwolona metoda." }, 405);
  try {
    const body = await req.json();
    const token = String(body.token ?? "");
    const action = String(body.action ?? "update");
    const name = String(body.name ?? "").trim();
    const gift = String(body.gift ?? "").trim();
    const url = String(body.url ?? "").trim();
    const notes = String(body.notes ?? "").trim();
    if (token.length < 30) return json({ error: "Nieprawidłowy link edycji." }, 400);
    if (action === "update" && (!name || name.length > 60 || !gift || gift.length > 180 || notes.length > 500 || !validUrl(url))) {
      return json({ error: "Sprawdź poprawność formularza i linku." }, 400);
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (action === "get") {
      const { data, error } = await supabase.from("wishlists")
        .select("name,gift,url,notes,hidden_at")
        .eq("edit_token_hash", await sha256(token)).maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Nieprawidłowy link edycji." }, 404);
      return json({ item: data });
    }
    if (action !== "hide" && action !== "update") return json({ error: "Nieznana operacja." }, 400);
    const update = action === "hide"
      ? { hidden_at: new Date().toISOString() }
      : { name, gift, url: url || null, notes: notes || null, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from("wishlists")
      .update(update)
      .eq("edit_token_hash", await sha256(token)).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return json({ error: "Nieprawidłowy link edycji." }, 404);
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: "Nie udało się zapisać zmian." }, 500);
  }
});