-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enum types
create type user_role as enum ('admin', 'client');
create type task_status as enum ('backlog', 'todo', 'doing', 'review', 'done');
create type task_priority as enum ('low', 'medium', 'high');
create type invoice_status as enum ('pending', 'paid', 'overdue');
create type client_status as enum ('active', 'inactive');

-- 1. Clients Table
create table public.clients (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    company text,
    email text,
    phone text,
    instagram text,
    monthly_fee numeric(10, 2) default 0,
    due_day integer default 5,
    status client_status default 'active',
    notes text,
    ai_context text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Profiles Table (Extends Supabase Auth)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    name text,
    email text,
    role user_role default 'client',
    client_id uuid references public.clients(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Plans Table
create table public.plans (
    id uuid primary key default uuid_generate_v4(),
    client_id uuid references public.clients(id) on delete cascade not null,
    month integer not null,
    year integer not null,
    posts_goal integer default 0,
    reels_goal integer default 0,
    stories_goal integer default 0,
    posts_completed integer default 0,
    reels_completed integer default 0,
    stories_completed integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(client_id, month, year)
);

-- 4. Tasks Table
create table public.tasks (
    id uuid primary key default uuid_generate_v4(),
    client_id uuid references public.clients(id) on delete cascade not null,
    title text not null,
    description text,
    status task_status default 'backlog',
    priority task_priority default 'medium',
    due_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CRM Notes Table
create table public.crm_notes (
    id uuid primary key default uuid_generate_v4(),
    client_id uuid references public.clients(id) on delete cascade not null,
    note text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Invoices Table
create table public.invoices (
    id uuid primary key default uuid_generate_v4(),
    client_id uuid references public.clients(id) on delete cascade not null,
    amount numeric(10, 2) not null,
    due_date date not null,
    status invoice_status default 'pending',
    paid_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Timeline Events Table
create table public.timeline_events (
    id uuid primary key default uuid_generate_v4(),
    client_id uuid references public.clients(id) on delete cascade not null,
    title text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES --
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.plans enable row level security;
alter table public.tasks enable row level security;
alter table public.crm_notes enable row level security;
alter table public.invoices enable row level security;
alter table public.timeline_events enable row level security;

-- Admin role function for RLS
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Get user's client_id for RLS
create or replace function public.get_user_client_id()
returns uuid as $$
  select client_id from public.profiles where id = auth.uid();
$$ language sql security definer set search_path = public;

-- Profiles Policies
create policy "Admins can do everything on profiles" on public.profiles to authenticated using (public.is_admin());
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

-- Clients Policies
create policy "Admins can do everything on clients" on public.clients to authenticated using (public.is_admin());
create policy "Clients can view their own client data" on public.clients for select to authenticated using (id = public.get_user_client_id());

-- Plans Policies
create policy "Admins can do everything on plans" on public.plans to authenticated using (public.is_admin());
create policy "Clients can view their own plans" on public.plans for select to authenticated using (client_id = public.get_user_client_id());

-- Tasks Policies
create policy "Admins can do everything on tasks" on public.tasks to authenticated using (public.is_admin());
create policy "Clients can view their own tasks" on public.tasks for select to authenticated using (client_id = public.get_user_client_id());

-- CRM Notes Policies
create policy "Admins can do everything on CRM notes" on public.crm_notes to authenticated using (public.is_admin());
-- Clients cannot view CRM notes (internal only)

-- Invoices Policies
create policy "Admins can do everything on invoices" on public.invoices to authenticated using (public.is_admin());
create policy "Clients can view their own invoices" on public.invoices for select to authenticated using (client_id = public.get_user_client_id());

-- Timeline Events Policies
create policy "Admins can do everything on timeline events" on public.timeline_events to authenticated using (public.is_admin());
create policy "Clients can view their own timeline events" on public.timeline_events for select to authenticated using (client_id = public.get_user_client_id());

-- TRIGGERS FOR TIMELINE EVENTS --

-- 1. Trigger for Client Created
create or replace function log_client_created() returns trigger as $$
begin
  insert into public.timeline_events (client_id, title, description)
  values (new.id, 'Cliente cadastrado', 'O cliente ' || new.name || ' foi adicionado ao sistema.');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger client_created_trigger
after insert on public.clients
for each row execute function log_client_created();

-- 2. Trigger for Client Edited
create or replace function log_client_edited() returns trigger as $$
begin
  insert into public.timeline_events (client_id, title, description)
  values (new.id, 'Cadastro atualizado', 'Os dados do cliente foram atualizados.');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger client_edited_trigger
after update on public.clients
for each row
when (old.name is distinct from new.name or old.status is distinct from new.status or old.monthly_fee is distinct from new.monthly_fee)
execute function log_client_edited();

-- 3. Trigger for Task Completed
create or replace function log_task_completed() returns trigger as $$
begin
  if new.status = 'done' and old.status != 'done' then
    insert into public.timeline_events (client_id, title, description)
    values (new.client_id, 'Tarefa concluída', 'A tarefa "' || new.title || '" foi finalizada.');
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger task_completed_trigger
after update on public.tasks
for each row execute function log_task_completed();

-- 4. Trigger for Invoice Paid
create or replace function log_invoice_paid() returns trigger as $$
begin
  if new.status = 'paid' and old.status != 'paid' then
    insert into public.timeline_events (client_id, title, description)
    values (new.client_id, 'Pagamento registrado', 'O pagamento no valor de R$ ' || new.amount || ' foi confirmado.');
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger invoice_paid_trigger
after update on public.invoices
for each row execute function log_invoice_paid();

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (new.id, new.raw_user_meta_data->>'name', new.email, 'client');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. WhatsApp Config Table (single global row for admin)
create table if not exists public.whatsapp_config (
    id text primary key default 'default',
    instance text,
    api_url text default 'https://free.uazapi.com',
    token text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into public.whatsapp_config (id) values ('default') on conflict do nothing;

alter table public.whatsapp_config enable row level security;

create policy "Admins can do everything on whatsapp_config"
    on public.whatsapp_config
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- PERFORMANCE INDEXES --

-- Indexes to prevent full table scans on foreign keys and RLS policies
create index if not exists idx_profiles_client_id on public.profiles(client_id);
create index if not exists idx_plans_client_id on public.plans(client_id);
create index if not exists idx_tasks_client_id on public.tasks(client_id);
create index if not exists idx_crm_notes_client_id on public.crm_notes(client_id);
create index if not exists idx_invoices_client_id on public.invoices(client_id);
create index if not exists idx_timeline_events_client_id on public.timeline_events(client_id);
