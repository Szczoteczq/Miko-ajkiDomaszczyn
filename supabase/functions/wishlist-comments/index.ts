import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return json({ error: "Niedozwolona metoda." }, 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (req.method === "GET") {
      const wishlistId = new URL(req.url).searchParams.get("wishlist_id");

      if (!wishlistId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(wishlistId)) {
        return json({ error: "Nieprawidłowy identyfikator prezentu." }, 400);
      }

      const { data, error } = await supabase
        .from("wishlist_comments")
        .select("id,body,created_at")
        .eq("wishlist_id", wishlistId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      return json({ comments: data ?? [] });
    }

    const payload = await req.json().catch(() => null);

    if (!payload || typeof payload.wishlist_id !== "string" || typeof payload.body !== "string") {
      return json({ error: "Nieprawidłowe dane komentarza." }, 400);
    }

    const wishlistId = payload.wishlist_id;
    const body = payload.body.trim();

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(wishlistId)) {
      return json({ error: "Nieprawidłowy identyfikator prezentu." }, 400);
    }

    if (body.length < 1 || body.length > 500) {
      return json({ error: "Komentarz musi mieć od 1 do 500 znaków." }, 400);
    }

    const { data: wishlist, error: wishlistError } = await supabase
      .from("wishlists")
      .select("id")
      .eq("id", wishlistId)
      .maybeSingle();

    if (wishlistError) throw wishlistError;

    if (!wishlist) {
      return json({ error: "Ten prezent już nie istnieje." }, 404);
    }

    const { data, error } = await supabase
      .from("wishlist_comments")
      .insert({ wishlist_id: wishlistId, body })
      .select("id,body,created_at")
      .single();

    if (error) throw error;

    return json({ comment: data }, 201);
  } catch (error) {
    console.error(error);
    return json({ error: "Nie udało się obsłużyć komentarza." }, 500);
  }
});
