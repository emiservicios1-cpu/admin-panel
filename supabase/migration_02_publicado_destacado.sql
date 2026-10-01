-- Ejecutar UNA vez en Supabase > SQL Editor (después de schema.sql).
do $$
declare t text;
begin
  foreach t in array array['hotel_rooms','vehicles','properties','services'] loop
    execute format('alter table %I add column if not exists published boolean not null default true', t);
    execute format('alter table %I add column if not exists featured boolean not null default false', t);
    -- El público (anon) solo ve lo publicado; los admins (authenticated) ven todo por la política "admin write".
    execute format('drop policy if exists "public read" on %I', t);
    execute format('drop policy if exists "public read published" on %I', t);
    execute format('create policy "public read published" on %I for select to anon using (published = true)', t);
  end loop;
end $$;
