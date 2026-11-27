import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json, validUrl } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Niedozwolona metoda." }, 405);
  try {
    const body = await req.json();
    const supplied = String(body.password ?? "");
    const expected = Deno.env.get("ADMIN_PASSWORD") ?? "";
    if (!expected || supplied !== expected) return json({ error: "Nieprawidłowe hasło administratora." }, 401);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const action = String(body.action ?? "");
    if (action === "list") {
      const { data, error } = await supabase.from("wishlists")
        .select("id,name,gift,url,notes,created_at,updated_at,hidden_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ items: data ?? [] });
    }
    if (action === "hide" || action === "restore") {
      const { error } = await supabase.from("wishlists")
        .update({ hidden_at: action === "hide" ? new Date().toISOString() : null })
        .eq("id", String(body.id ?? ""));
      if (error) throw error;
      return json({ ok: true });
    }
    if (action === "update") {
      const name = String(body.name ?? "").trim();
      const gift = String(body.gift ?? "").trim();
      const url = String(body.url ?? "").trim();
      const notes = String(body.notes ?? "").trim();
      if (!body.id || !name || name.length > 60 || !gift || gift.length > 180 || notes.length > 500 || !validUrl(url)) {
        return json({ error: "Nieprawidłowe dane wpisu." }, 400);
      }
      const { error } = await supabase.from("wishlists").update({
        name, gift, url: url || null, notes: notes || null, updated_at: new Date().toISOString()
      }).eq("id", String(body.id));
      if (error) throw error;
      return json({ ok: true });
    }
    return json({ error: "Nieznana operacja." }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "Błąd panelu administratora." }, 500);
  }
});