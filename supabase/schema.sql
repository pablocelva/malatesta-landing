create table if not exists pedales (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  category      text not null,
  category_emoji text not null default '',
  type          text not null default '',
  typology      text not null default '',
  tags          text not null default '',
  rarity        text not null default '',
  condition     text not null default 'MINT',
  condition_detail text not null default '',
  price         integer not null default 0,
  price_floor   integer not null default 0,
  price_optimistic integer not null default 0,
  in_use        boolean not null default false,
  available     boolean not null default true,
  image_url     text not null default '',
  notes         text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_pedales_category on pedales (category);
create index if not exists idx_pedales_slug on pedales (slug);

-- RLS: public read, authenticated write
alter table pedales enable row level security;

create policy "Public read access"
  on pedales for select
  using (true);

create policy "Authenticated insert"
  on pedales for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated update"
  on pedales for update
  using (auth.role() = 'authenticated');

create policy "Authenticated delete"
  on pedales for delete
  using (auth.role() = 'authenticated');
