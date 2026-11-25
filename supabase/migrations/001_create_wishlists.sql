create extension if not exists pgcrypto;

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  gift text not null check (char_length(gift) between 1 and 180),
  url text,
  notes text check (notes is null or char_length(notes) <= 500),
  edit_token_hash text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wishlists_created_at_idx on public.wishlists (created_at desc);
alter table public.wishlists enable row level security;

-- Wszystkie operacje przechodzą przez Edge Functions z kluczem service role.
-- Nie twórz publicznych polityk SELECT/INSERT/UPDATE/DELETE dla tej tabeli.
revoke all on public.wishlists from anon, authenticated;
grant all on public.wishlists to service_role;