-- =====================================================================
-- Migration 0005: invito collaboratore per email
-- =====================================================================

create or replace function public.invite_collaborator_by_email(
  p_team_id uuid,
  p_email text,
  p_role team_role
)
returns text
language plpgsql security definer as $$
declare
  v_user_id uuid;
begin
  if not public.is_team_coach(p_team_id) then
    raise exception 'Solo l''allenatore può invitare collaboratori';
  end if;

  select id into v_user_id from auth.users where email = lower(p_email);

  if v_user_id is null then
    return 'not_found';
  end if;

  insert into public.team_members (team_id, user_id, role)
  values (p_team_id, v_user_id, p_role)
  on conflict (team_id, user_id) do update set role = excluded.role;

  return 'ok';
end;
$$;
