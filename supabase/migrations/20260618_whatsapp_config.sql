-- WhatsApp instance configuration (single-row global settings for admin)
create table if not exists public.whatsapp_config (
    id text primary key default 'default',
    instance text,
    api_url text default 'https://free.uazapi.com',
    token text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed the single default row so upsert always works
insert into public.whatsapp_config (id) values ('default') on conflict do nothing;

alter table public.whatsapp_config enable row level security;

-- Only admins can read/write
create policy "Admins can do everything on whatsapp_config"
    on public.whatsapp_config
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
