create table if not exists public.wishlist_comments (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists wishlist_comments_wishlist_created_idx
  on public.wishlist_comments (wishlist_id, created_at asc);

alter table public.wishlist_comments enable row level security;

revoke all on public.wishlist_comments from anon, authenticated;
grant all on public.wishlist_comments to service_role;
