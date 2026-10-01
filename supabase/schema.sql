-- Ejecutar en Supabase > SQL Editor. Ajustá los nombres si tus tablas ya existen.

create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  company_name text, logo_url text, phone text, whatsapp text, email text, address text,
  facebook text, instagram text, seo_title text, seo_description text,
  updated_at timestamptz default now()
);

create table if not exists hotel_rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null, type text, capacity int, price_per_night numeric(12,2),
  amenities text[] default '{}', images text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  title text not null, brand text, model text, year int, mileage int,
  transmission text, fuel text, price numeric(14,2), images text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  title text not null, operation_type text, property_type text,
  price numeric(14,2), area_m2 numeric(10,2), rooms int, images text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null, category text, description text, images text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text, phone text, message text,
  status text not null default 'nuevo' check (status in ('nuevo','contactado')),
  created_at timestamptz default now()
);

-- RLS: el sitio público lee contenido; solo usuarios autenticados escriben.
do $$
declare t text;
begin
  foreach t in array array['site_settings','hotel_rooms','vehicles','properties','services'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('create policy "admin write" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- Leads: cualquiera puede enviar el formulario; solo el admin los ve y gestiona.
alter table leads enable row level security;
create policy "public insert" on leads for insert to anon, authenticated with check (true);
create policy "admin read" on leads for select to authenticated using (true);
create policy "admin update" on leads for update to authenticated using (true) with check (true);
create policy "admin delete" on leads for delete to authenticated using (true);

-- Storage: bucket público `media`
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media');
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media');
