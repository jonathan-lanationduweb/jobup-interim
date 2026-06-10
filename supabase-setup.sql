-- ============================================================================
--  JOBUP Intérim — Configuration Supabase (table "jobs" + RLS)
--  À coller dans : Supabase → SQL Editor → New query → Run
-- ============================================================================

-- 1) Table des offres (le détail de l'offre est stocké en JSON dans "data")
create table if not exists public.jobs (
  id          text primary key,
  status      text not null default 'publié',
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- 2) Activer la sécurité au niveau des lignes (RLS)
alter table public.jobs enable row level security;

-- 3) Politiques d'accès
--    a) Tout le monde (visiteurs) peut LIRE les offres publiées
drop policy if exists "lecture publique offres publiees" on public.jobs;
create policy "lecture publique offres publiees"
  on public.jobs for select
  using (status = 'publié');

--    b) Les admins connectés voient TOUTES les offres (y compris brouillons)
drop policy if exists "admins lisent tout" on public.jobs;
create policy "admins lisent tout"
  on public.jobs for select to authenticated
  using (true);

--    c) Les admins connectés peuvent créer / modifier / supprimer
drop policy if exists "admins inserent" on public.jobs;
create policy "admins inserent"
  on public.jobs for insert to authenticated with check (true);

drop policy if exists "admins modifient" on public.jobs;
create policy "admins modifient"
  on public.jobs for update to authenticated using (true) with check (true);

drop policy if exists "admins suppriment" on public.jobs;
create policy "admins suppriment"
  on public.jobs for delete to authenticated using (true);

-- ============================================================================
--  Ensuite :
--  1. Authentication → Users → "Add user" : créez l'email + mot de passe admin.
--  2. Ouvrez /admin.html, connectez-vous avec cet email/mot de passe.
--  3. Cliquez sur « Réinitialiser (démo) » : les 12 offres de démonstration
--     sont importées dans Supabase et deviennent visibles par tous les visiteurs.
--  4. Gérez ensuite les offres depuis le backoffice.
-- ============================================================================
