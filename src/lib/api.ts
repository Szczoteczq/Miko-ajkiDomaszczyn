import type { Wishlist } from "../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

async function callFunction<T>(name: string, body?: unknown, method = "POST"): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Brakuje konfiguracji Supabase. Uzupełnij plik .env.");
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Coś poszło nie tak. Spróbuj ponownie.");
  return data as T;
}

export const api = {
  create: (payload: { name: string; gift: string; url: string; notes: string }) =>
    callFunction<{ token: string }>("create-wishlist", payload),
  list: () => callFunction<{ items: Wishlist[] }>("list-wishlists", undefined, "GET"),
  edit: (payload: { token: string; name: string; gift: string; url: string; notes: string }) =>
    callFunction<{ ok: true }>("edit-wishlist", payload),
  admin: (payload: Record<string, unknown>) =>
    callFunction<{ items?: Wishlist[]; ok?: true }>("admin-wishlists", payload)
};

export function friendlyError(error: unknown): string {
  return error instanceof Error ? error.message : "Wystąpił nieznany błąd.";
}