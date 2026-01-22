
-- ==========================================================
-- SCRIPT DE CONFIGURAÇÃO EA_DRIVE - SUPABASE
-- Copie e cole este código no "SQL Editor" do seu Supabase
-- ==========================================================

-- 1. CRIAR TABELAS (Caso ainda não existam)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('Admin', 'User')) default 'User',
  updated_at timestamp with time zone default now()
);

create table if not exists public.proposals (
  id uuid default gen_random_uuid() primary key,
  dvt_number text not null,
  revision_number integer default 0,
  client text not null,
  project_type text not null,
  opening_date date not null,
  start_date date not null,
  expected_tech_date date,
  expected_comm_date date,
  actual_tech_date date,
  actual_comm_date date,
  technical_responsible text,
  commercial_consultant text,
  proposal_type text not null,
  status text not null,
  estimated_value numeric default 0,
  sent_value numeric default 0,
  user_id uuid references auth.users,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  loss_reason_details text,
  competitor text,
  manager_checklist text default 'Não'
);

create table if not exists public.proposal_revisions (
  id uuid default gen_random_uuid() primary key,
  proposal_id uuid references public.proposals on delete cascade,
  revision_number integer not null,
  reason_type text not null,
  description text,
  created_at timestamp with time zone default now(),
  user_name text,
  value_at_revision numeric
);

create table if not exists public.system_logs (
  id uuid default gen_random_uuid() primary key,
  proposal_id uuid references public.proposals on delete set null,
  user_name text,
  action text not null,
  details text,
  created_at timestamp with time zone default now()
);

-- 2. RESOLVER MENSAGEM DO DASHBOARD (ATIVAR RLS)
-- Isso ativa a segurança de linha. O aviso desaparecerá após criar as políticas abaixo.
alter table public.profiles enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_revisions enable row level security;
alter table public.system_logs enable row level security;

-- 3. CRIAR POLÍTICAS DE ACESSO
-- Permite que qualquer usuário que fez login (Authenticated) possa ler e escrever dados.
create policy "Acesso Total Autenticado" on public.profiles for all to authenticated using (true) with check (true);
create policy "Acesso Total Autenticado" on public.proposals for all to authenticated using (true) with check (true);
create policy "Acesso Total Autenticado" on public.proposal_revisions for all to authenticated using (true) with check (true);
create policy "Acesso Total Autenticado" on public.system_logs for all to authenticated using (true) with check (true);

-- 4. AUTOMAÇÃO DE PERFIL
-- Garante que sempre que um novo usuário for criado, ele tenha um registro na tabela profiles.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Usuário EA'), 'Admin');
  return new;
end;
$$ language plpgsql security definer;

-- Remove trigger antigo se existir para evitar duplicidade
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
