# Mikołajki Szkolne

Gotowy frontend React + TypeScript + Vite oraz backend Supabase Edge Functions.

## 1. Uruchomienie lokalne

W PowerShell, w folderze projektu:

```powershell
npm install
Copy-Item .env.example .env
```

Otwórz `.env` i wstaw swój **Supabase publishable key** w miejsce `WKLEJ_TUTAJ_SWÓJ_PUBLISHABLE_KEY`.

Następnie:

```powershell
npm run dev
```

Vite pokaże adres, zwykle `http://localhost:5173`.

## 2. Baza danych

W Supabase otwórz **SQL Editor**, wklej całą zawartość pliku:

`supabase/migrations/001_create_wishlists.sql` oraz `supabase/migrations/002_soft_hide_wishlists.sql`

Uruchom zapytanie.

Tabela ma włączone RLS i nie ma publicznych polityk. Frontend nie dostaje klucza service-role. Wszystkie operacje wykonują Edge Functions.

## 3. Edge Functions

Zainstaluj Supabase CLI i zaloguj się:

```powershell
supabase login
supabase link --project-ref ydbrykjuovbfzbzrmpji
```

Ustaw hasło administratora jako sekret serwerowy (nie w `.env` i nie w kodzie frontendowym):

```powershell
supabase secrets set ADMIN_PASSWORD="WSTAW_TUTAJ_MOCNE_HASLO"
```

Wdroż cztery funkcje:

```powershell
supabase functions deploy create-wishlist
supabase functions deploy list-wishlists
supabase functions deploy edit-wishlist
supabase functions deploy admin-wishlists
supabase functions deploy edit-wishlist
supabase functions deploy list-wishlists
```

Ważne: w projekcie Supabase musi być dostępne `SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` jako sekrety funkcji (Supabase udostępnia je domyślnie w środowisku Edge Functions).

## 4. Bezpieczeństwo i ważne uwagi

- Publishable key jest przeznaczony do użycia w przeglądarce. **Nigdy nie umieszczaj service-role key w pliku `.env` frontendu.**
- Link edycji zawiera długi losowy token. W bazie zapisywany jest tylko jego skrót SHA-256.
- Publiczna lista nie zwraca tokenów edycji.
- Hasło administratora jest sprawdzane po stronie Edge Function. Ustaw własne, mocne hasło zamiast przykładowego `administrator`.
- To jest działający szkielet MVP. Przed publicznym uruchomieniem dodaj limitowanie żądań / CAPTCHA i skonfiguruj własną domenę oraz politykę prywatności.
- Funkcje są ustawione z `verify_jwt = false`, ponieważ publiczne dodawanie i lista nie wymagają kont użytkowników. Dostęp do edycji chroni token, a admina hasło serwerowe.

## Strony

- `/` — dodawanie życzenia
- `/Lista` — publiczna lista z wyszukiwaniem
- `/Edytuj/:token` — edycja i ukrywanie własnego wpisu przez prywatny link
- Ukryte wpisy znikają z publicznej listy, ale administrator może je przywrócić w panelu.
- `/Admin` — panel organizatora
