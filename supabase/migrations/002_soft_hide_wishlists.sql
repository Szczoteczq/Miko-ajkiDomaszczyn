alter table public.wishlists
  add column if not exists hidden_at timestamptz;

create index if not exists wishlists_hidden_at_idx
  on public.wishlists (hidden_at);
