-- =====================================================================
-- Migration 0006: handle_new_user aggiornato per Google OAuth
-- Google popola raw_user_meta_data con 'full_name' o 'name' a seconda
-- del flusso, e la foto come 'avatar_url' o 'picture'. La funzione
-- controlla entrambe le varianti prima di usare la parte locale
-- dell'email come fallback finale.
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;
