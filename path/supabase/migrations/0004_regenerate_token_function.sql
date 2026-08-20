-- =====================================================================
-- Migration 0004: rigenerazione sicura del token giocatore
-- =====================================================================

create or replace function public.regenerate_player_token(p_player_id uuid)
returns text
language plpgsql security definer as $$
declare
  v_team_id uuid;
  v_new_token text;
begin
  select team_id into v_team_id from public.players where id = p_player_id;

  if v_team_id is null or not public.is_team_coach(v_team_id) then
    raise exception 'Non autorizzato';
  end if;

  v_new_token := encode(gen_random_bytes(24), 'base64url');

  update public.player_tokens
  set token = v_new_token, is_active = true, regenerated_at = now()
  where player_id = p_player_id;

  return v_new_token;
end;
$$;
