-- =====================================================================
-- COACH DIARY — Migration 0001: Initial Schema
-- Event Sourcing: la classifica NON viene mai salvata, viene sempre
-- ricalcolata da eventi (matches, tournament_matches, penalties).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
create type team_role as enum ('allenatore', 'vice', 'collaboratore');
create type attendance_status as enum ('presente', 'assente');
create type match_side as enum ('A', 'B');
create type tournament_mode as enum ('risultati', 'classifica');
create type player_position as enum ('portiere', 'difensore', 'centrocampista', 'attaccante');

-- ---------------------------------------------------------------------
-- PROFILES (estende auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- SEASONS (Stagioni) — ogni stagione è indipendente
-- ---------------------------------------------------------------------
create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_seasons_coach on public.seasons (coach_id);

-- ---------------------------------------------------------------------
-- TEAMS (Squadre) — una squadra per stagione
-- ---------------------------------------------------------------------
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  name text not null,
  logo_url text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_teams_season on public.teams (season_id);

-- ---------------------------------------------------------------------
-- TEAM MEMBERS (Collaboratori) — ruoli: allenatore/vice/collaboratore
-- ---------------------------------------------------------------------
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role team_role not null default 'collaboratore',
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);
create index idx_team_members_team on public.team_members (team_id);
create index idx_team_members_user on public.team_members (user_id);

-- ---------------------------------------------------------------------
-- PLAYERS (Giocatori)
-- ---------------------------------------------------------------------
create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  jersey_number smallint,
  position player_position,
  photo_url text,
  phone text,
  birth_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_players_team on public.players (team_id);

-- ---------------------------------------------------------------------
-- PLAYER TOKENS (Link giocatore /player/{token})
-- ---------------------------------------------------------------------
create table public.player_tokens (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null unique references public.players (id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(24), 'base64url'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  regenerated_at timestamptz
);
create index idx_player_tokens_token on public.player_tokens (token);

-- ---------------------------------------------------------------------
-- TRAININGS (Allenamenti)
-- ---------------------------------------------------------------------
create table public.trainings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  session_date date not null,
  title text,
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_trainings_team_date on public.trainings (team_id, session_date desc);

-- ---------------------------------------------------------------------
-- ATTENDANCES (Presenze) — non influenzano le partitelle
-- ---------------------------------------------------------------------
create table public.attendances (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  status attendance_status not null,
  created_at timestamptz not null default now(),
  unique (training_id, player_id)
);
create index idx_attendances_training on public.attendances (training_id);
create index idx_attendances_player on public.attendances (player_id);

-- ---------------------------------------------------------------------
-- MATCHES (Partitelle) — squadre manuali A/B, punti 3-1-0
-- ---------------------------------------------------------------------
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings (id) on delete cascade,
  team_a_name text not null default 'Squadra A',
  team_b_name text not null default 'Squadra B',
  score_a smallint not null default 0,
  score_b smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_matches_training on public.matches (training_id);

create table public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  team_side match_side not null,
  minutes_played smallint not null default 0,
  unique (match_id, player_id)
);
create index idx_match_players_match on public.match_players (match_id);
create index idx_match_players_player on public.match_players (player_id);

-- ---------------------------------------------------------------------
-- TOURNAMENTS (Tornei) — due modalità
-- ---------------------------------------------------------------------
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings (id) on delete cascade,
  name text not null,
  mode tournament_mode not null,
  created_at timestamptz not null default now()
);

create table public.tournament_teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  name text not null
);

-- modalità "risultati": partite tra team del torneo
create table public.tournament_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  team_a_id uuid not null references public.tournament_teams (id) on delete cascade,
  team_b_id uuid not null references public.tournament_teams (id) on delete cascade,
  score_a smallint not null default 0,
  score_b smallint not null default 0
);

-- modalità "classifica": posizione finale inserita manualmente
create table public.tournament_standing_entries (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  tournament_team_id uuid not null references public.tournament_teams (id) on delete cascade,
  final_position smallint not null,
  points smallint not null default 0,
  unique (tournament_id, tournament_team_id)
);

-- collega i players ai tournament_teams (per assegnare punti individuali)
create table public.tournament_team_players (
  id uuid primary key default gen_random_uuid(),
  tournament_team_id uuid not null references public.tournament_teams (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  unique (tournament_team_id, player_id)
);

-- ---------------------------------------------------------------------
-- RPE ENTRIES (Scala Borg 1-10) — carico = durata × RPE
-- ---------------------------------------------------------------------
create table public.rpe_entries (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  rpe smallint not null check (rpe between 1 and 10),
  duration_minutes smallint not null check (duration_minutes > 0),
  session_load smallint generated always as (rpe * duration_minutes) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (training_id, player_id)
);
create index idx_rpe_player_date on public.rpe_entries (player_id, created_at);

-- ---------------------------------------------------------------------
-- PENALTIES (Penalità)
-- ---------------------------------------------------------------------
create table public.penalties (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  points integer not null,
  reason text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);
create index idx_penalties_player on public.penalties (player_id);

-- ---------------------------------------------------------------------
-- ACTIVITY LOG
-- ---------------------------------------------------------------------
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams (id) on delete cascade,
  user_id uuid references public.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);
create index idx_activity_log_team_date on public.activity_log (team_id, created_at desc);

-- =====================================================================
-- TRIGGERS: updated_at automatico
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','seasons','teams','players','trainings','matches','rpe_entries']
  loop
    execute format('create trigger trg_set_updated_at before update on public.%I for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- =====================================================================
-- TRIGGER: activity log generico (players, trainings, matches, rpe, penalties)
-- =====================================================================
create or replace function public.log_activity()
returns trigger language plpgsql security definer as $$
declare
  v_team_id uuid;
begin
  begin
    v_team_id := coalesce(
      (to_jsonb(new)->>'team_id')::uuid,
      (select team_id from public.trainings where id = (to_jsonb(new)->>'training_id')::uuid)
    );
  exception when others then
    v_team_id := null;
  end;

  insert into public.activity_log (team_id, user_id, action, entity_type, entity_id, old_value, new_value)
  values (
    v_team_id,
    auth.uid(),
    tg_op,
    tg_table_name,
    (to_jsonb(new)->>'id')::uuid,
    case when tg_op = 'UPDATE' then to_jsonb(old) else null end,
    to_jsonb(new)
  );
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['players','trainings','matches','rpe_entries','penalties']
  loop
    execute format('create trigger trg_log_activity after insert or update on public.%I for each row execute function public.log_activity();', t);
  end loop;
end $$;

-- =====================================================================
-- HELPER: verifica appartenenza al team (per RLS)
-- =====================================================================
create or replace function public.is_team_member(p_team_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.teams tm
    join public.seasons s on s.id = tm.season_id
    where tm.id = p_team_id and s.coach_id = auth.uid()
  ) or exists (
    select 1 from public.team_members mem
    where mem.team_id = p_team_id and mem.user_id = auth.uid()
  );
$$;

create or replace function public.is_team_coach(p_team_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.teams tm
    join public.seasons s on s.id = tm.season_id
    where tm.id = p_team_id and s.coach_id = auth.uid()
  );
$$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.players enable row level security;
alter table public.player_tokens enable row level security;
alter table public.trainings enable row level security;
alter table public.attendances enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_teams enable row level security;
alter table public.tournament_matches enable row level security;
alter table public.tournament_standing_entries enable row level security;
alter table public.tournament_team_players enable row level security;
alter table public.rpe_entries enable row level security;
alter table public.penalties enable row level security;
alter table public.activity_log enable row level security;

create policy "profiles_self" on public.profiles for all
  using (id = auth.uid()) with check (id = auth.uid());

create policy "seasons_owner" on public.seasons for all
  using (coach_id = auth.uid()) with check (coach_id = auth.uid());

create policy "teams_access" on public.teams for select
  using (public.is_team_member(id));
create policy "teams_write" on public.teams for insert with check (
  exists (select 1 from public.seasons s where s.id = season_id and s.coach_id = auth.uid())
);
create policy "teams_update" on public.teams for update using (public.is_team_coach(id));
create policy "teams_delete" on public.teams for delete using (public.is_team_coach(id));

create policy "team_members_read" on public.team_members for select
  using (public.is_team_member(team_id));
create policy "team_members_manage" on public.team_members for all
  using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));

-- pattern ripetuto per tutte le tabelle figlie di team/training: lettura ai
-- membri del team, scrittura ai membri del team (collaboratore/vice/allenatore)
create policy "players_read" on public.players for select using (public.is_team_member(team_id));
create policy "players_write" on public.players for all
  using (public.is_team_member(team_id)) with check (public.is_team_member(team_id));

create policy "player_tokens_coach_only" on public.player_tokens for all
  using (public.is_team_coach((select team_id from public.players p where p.id = player_id)))
  with check (public.is_team_coach((select team_id from public.players p where p.id = player_id)));

create policy "trainings_read" on public.trainings for select using (public.is_team_member(team_id));
create policy "trainings_write" on public.trainings for all
  using (public.is_team_member(team_id)) with check (public.is_team_member(team_id));

create policy "attendances_rw" on public.attendances for all
  using (public.is_team_member((select team_id from public.trainings t where t.id = training_id)))
  with check (public.is_team_member((select team_id from public.trainings t where t.id = training_id)));

create policy "matches_rw" on public.matches for all
  using (public.is_team_member((select team_id from public.trainings t where t.id = training_id)))
  with check (public.is_team_member((select team_id from public.trainings t where t.id = training_id)));

create policy "match_players_rw" on public.match_players for all
  using (public.is_team_member((select t.team_id from public.matches m join public.trainings t on t.id = m.training_id where m.id = match_id)))
  with check (public.is_team_member((select t.team_id from public.matches m join public.trainings t on t.id = m.training_id where m.id = match_id)));

create policy "tournaments_rw" on public.tournaments for all
  using (public.is_team_member((select team_id from public.trainings t where t.id = training_id)))
  with check (public.is_team_member((select team_id from public.trainings t where t.id = training_id)));

create policy "tournament_teams_rw" on public.tournament_teams for all
  using (public.is_team_member((select t.team_id from public.tournaments tr join public.trainings t on t.id = tr.training_id where tr.id = tournament_id)))
  with check (public.is_team_member((select t.team_id from public.tournaments tr join public.trainings t on t.id = tr.training_id where tr.id = tournament_id)));

create policy "tournament_matches_rw" on public.tournament_matches for all
  using (public.is_team_member((select t.team_id from public.tournaments tr join public.trainings t on t.id = tr.training_id where tr.id = tournament_id)))
  with check (public.is_team_member((select t.team_id from public.tournaments tr join public.trainings t on t.id = tr.training_id where tr.id = tournament_id)));

create policy "tournament_standing_entries_rw" on public.tournament_standing_entries for all
  using (public.is_team_member((select t.team_id from public.tournaments tr join public.trainings t on t.id = tr.training_id where tr.id = tournament_id)))
  with check (public.is_team_member((select t.team_id from public.tournaments tr join public.trainings t on t.id = tr.training_id where tr.id = tournament_id)));

create policy "tournament_team_players_rw" on public.tournament_team_players for all
  using (public.is_team_member((select p.team_id from public.players p where p.id = player_id)))
  with check (public.is_team_member((select p.team_id from public.players p where p.id = player_id)));

create policy "rpe_entries_rw" on public.rpe_entries for all
  using (public.is_team_member((select team_id from public.trainings t where t.id = training_id)))
  with check (public.is_team_member((select team_id from public.trainings t where t.id = training_id)));

create policy "penalties_rw" on public.penalties for all
  using (public.is_team_member(team_id)) with check (public.is_team_member(team_id));

create policy "activity_log_read" on public.activity_log for select using (public.is_team_member(team_id));

-- NOTA SICUREZZA: l'Area Giocatore (/player/{token}) NON usa una sessione
-- Supabase Auth. Le Server Action che servono quella pagina usano il
-- client Supabase con service_role (server-side, mai esposto al client),
-- verificano manualmente player_tokens.token = :token AND is_active = true,
-- e SOLO DOPO leggono i dati in sola lettura. RLS resta comunque attiva
-- su tutte le tabelle per qualunque altro accesso.

-- =====================================================================
-- VIEW / FUNCTION: classifica ricalcolata (Event Sourcing)
-- =====================================================================
create or replace function public.get_team_standings(p_team_id uuid)
returns table (
  player_id uuid,
  full_name text,
  played smallint,
  wins smallint,
  draws smallint,
  losses smallint,
  points bigint,
  attendances_count bigint,
  matches_count bigint,
  minutes_total bigint,
  win_rate numeric,
  penalty_points bigint
) language sql stable as $$
  with match_results as (
    select
      mp.player_id,
      m.id as match_id,
      case
        when (mp.team_side = 'A' and m.score_a > m.score_b) or (mp.team_side = 'B' and m.score_b > m.score_a) then 'W'
        when m.score_a = m.score_b then 'D'
        else 'L'
      end as result,
      mp.minutes_played
    from public.match_players mp
    join public.matches m on m.id = mp.match_id
    join public.trainings t on t.id = m.training_id
    where t.team_id = p_team_id
  ),
  agg as (
    select
      player_id,
      count(*) filter (where result = 'W') as wins,
      count(*) filter (where result = 'D') as draws,
      count(*) filter (where result = 'L') as losses,
      count(*) as played,
      sum(minutes_played) as minutes_total
    from match_results
    group by player_id
  ),
  penalties_agg as (
    select player_id, sum(points) as penalty_points
    from public.penalties where team_id = p_team_id
    group by player_id
  ),
  attendance_agg as (
    select a.player_id, count(*) filter (where a.status = 'presente') as presences
    from public.attendances a
    join public.trainings t on t.id = a.training_id
    where t.team_id = p_team_id
    group by a.player_id
  )
  select
    p.id,
    p.first_name || ' ' || p.last_name,
    coalesce(agg.played, 0)::smallint,
    coalesce(agg.wins, 0)::smallint,
    coalesce(agg.draws, 0)::smallint,
    coalesce(agg.losses, 0)::smallint,
    coalesce(agg.wins, 0) * 3 + coalesce(agg.draws, 0) - coalesce(pen.penalty_points, 0) as points,
    coalesce(att.presences, 0) as attendances_count,
    coalesce(agg.played, 0) as matches_count,
    coalesce(agg.minutes_total, 0) as minutes_total,
    case when coalesce(agg.played, 0) = 0 then 0
      else round(100.0 * agg.wins / agg.played, 1) end as win_rate,
    coalesce(pen.penalty_points, 0) as penalty_points
  from public.players p
  left join agg on agg.player_id = p.id
  left join penalties_agg pen on pen.player_id = p.id
  left join attendance_agg att on att.player_id = p.id
  where p.team_id = p_team_id
  order by points desc, win_rate desc;
$$;

-- =====================================================================
-- FUNCTION: carico allenamento (ACWR, monotonia, strain)
-- Acute = media 7gg, Chronic = media 28gg (standard sport science)
-- =====================================================================
create or replace function public.get_player_workload(p_player_id uuid)
returns table (
  training_date date,
  session_load smallint,
  acute_load numeric,
  chronic_load numeric,
  acwr numeric,
  monotony numeric,
  strain numeric
) language sql stable as $$
  with loads as (
    select t.session_date, r.session_load
    from public.rpe_entries r
    join public.trainings t on t.id = r.training_id
    where r.player_id = p_player_id
    order by t.session_date
  ),
  windows as (
    select
      session_date,
      session_load,
      avg(session_load) over (order by session_date rows between 6 preceding and current row) as acute_load,
      avg(session_load) over (order by session_date rows between 27 preceding and current row) as chronic_load,
      stddev_pop(session_load) over (order by session_date rows between 6 preceding and current row) as sd_7d,
      sum(session_load) over (order by session_date rows between 6 preceding and current row) as sum_7d
    from loads
  )
  select
    session_date,
    session_load,
    round(acute_load, 1),
    round(chronic_load, 1),
    case when chronic_load > 0 then round(acute_load / chronic_load, 2) else null end,
    case when sd_7d > 0 then round(acute_load / sd_7d, 2) else null end,
    case when sd_7d > 0 then round(sum_7d * (acute_load / sd_7d), 1) else null end
  from windows
  order by session_date;
$$;
