-- =====================================================================
-- Migration 0003: creazione atomica stagione + squadra (onboarding)
-- =====================================================================

create or replace function public.create_season_with_team(
  p_season_name text,
  p_team_name text,
  p_category text default null
)
returns table (season_id uuid, team_id uuid)
language plpgsql security definer as $$
declare
  v_season_id uuid;
  v_team_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Non autenticato';
  end if;

  insert into public.seasons (coach_id, name)
  values (auth.uid(), p_season_name)
  returning id into v_season_id;

  insert into public.teams (season_id, name, category)
  values (v_season_id, p_team_name, p_category)
  returning id into v_team_id;

  return query select v_season_id, v_team_id;
end;
$$;
