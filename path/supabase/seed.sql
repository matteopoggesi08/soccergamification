-- =====================================================================
-- SEED — dati di esempio per sviluppo locale
-- Presuppone un utente auth già creato (sostituire l'UUID sotto con
-- quello reale ottenuto da `supabase auth` dopo la registrazione).
-- =====================================================================

-- 1. Sostituire con l'id reale dell'utente creato via Supabase Auth
-- insert into public.profiles (id, full_name) values
--   ('00000000-0000-0000-0000-000000000001', 'Mister Demo');

-- 2. Stagione
insert into public.seasons (id, coach_id, name, start_date, end_date)
values ('10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        '2025/2026', '2025-09-01', '2026-06-30');

-- 3. Squadra
insert into public.teams (id, season_id, name, category)
values ('20000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'Under 15', 'Giovanissimi');

-- 4. Giocatori
insert into public.players (id, team_id, first_name, last_name, jersey_number, position)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Marco', 'Rossi', 7, 'attaccante'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Luca', 'Bianchi', 4, 'difensore'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Andrea', 'Verdi', 10, 'centrocampista');

-- 5. Link giocatore
insert into public.player_tokens (player_id)
select id from public.players where team_id = '20000000-0000-0000-0000-000000000001';

-- 6. Allenamento di esempio
insert into public.trainings (id, team_id, session_date, title, created_by)
values ('40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        current_date, 'Seduta tecnica', '00000000-0000-0000-0000-000000000001');
