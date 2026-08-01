-- ============ TIPOS ============
create type user_role as enum ('comprador','artesano','admin');
create type verification_status as enum ('no_verificado','pendiente','verificado','rechazado');
create type request_status as enum ('pendiente','aprobada','rechazada');
create type product_category as enum
  ('carteras_bolsos','zapatos_cuero','quesos_alimentos','ceramica','tejidos','joyeria','madera','otros');

-- ============ TABLAS ============
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null default '',
  avatar_url text,
  role user_role not null default 'comprador',
  created_at timestamptz not null default now()
);

create table public.artisans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  slug text not null unique,
  shop_name text not null,
  story text not null default '',
  comuna text not null default '',
  main_category product_category not null default 'otros',
  profile_photo_url text,
  cover_photo_url text,
  instagram_url text,
  facebook_url text,
  whatsapp_phone text,
  contact_email text,
  verification_status verification_status not null default 'no_verificado',
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  name text not null,
  description text not null default '',
  price_clp int check (price_clp >= 0),
  category product_category not null,
  photo_urls text[] not null default '{}',
  available boolean not null default true,
  created_at timestamptz not null default now()
);
create index products_artisan_idx on public.products(artisan_id);
create index products_created_idx on public.products(created_at desc);

create table public.market_schedules (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 7),
  place_name text not null,
  comuna text not null default '',
  time_range text not null default '',
  notes text not null default ''
);
create index schedules_artisan_idx on public.market_schedules(artisan_id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  comment text not null default '',
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artisan_id, author_id)
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  stall_photo_path text not null,
  making_photo_path text not null,
  video_path text,
  video_url text,
  message text not null default '',
  status request_status not null default 'pendiente',
  admin_comment text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ============ TRIGGERS ============
-- Perfil automático al registrarse
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recalcular rating del artesano (ignora reviews ocultas)
create function public.recalc_artisan_rating() returns trigger
language plpgsql security definer set search_path = public as $$
declare aid uuid;
begin
  aid := coalesce(new.artisan_id, old.artisan_id);
  update public.artisans set
    rating_avg = coalesce((select round(avg(stars)::numeric, 2) from public.reviews where artisan_id = aid and not hidden), 0),
    rating_count = (select count(*) from public.reviews where artisan_id = aid and not hidden)
  where id = aid;
  return null;
end $$;
create trigger on_review_change after insert or update or delete on public.reviews
  for each row execute function public.recalc_artisan_rating();

-- Sincronizar estado de verificación del artesano con su solicitud
create function public.sync_artisan_verification() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.artisans set verification_status =
    case new.status
      when 'pendiente' then 'pendiente'::verification_status
      when 'aprobada' then 'verificado'::verification_status
      when 'rechazada' then 'rechazado'::verification_status
    end
  where id = new.artisan_id;
  return null;
end $$;
create trigger on_request_change after insert or update of status on public.verification_requests
  for each row execute function public.sync_artisan_verification();

-- updated_at en reviews
create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger on_review_touch before update on public.reviews
  for each row execute function public.touch_updated_at();

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.artisans enable row level security;
alter table public.products enable row level security;
alter table public.market_schedules enable row level security;
alter table public.reviews enable row level security;
alter table public.verification_requests enable row level security;

create policy "profiles públicos" on public.profiles for select using (true);
create policy "editar mi perfil" on public.profiles for update using (auth.uid() = id);

create policy "artesanos públicos" on public.artisans for select using (true);
create policy "crear mi artesano" on public.artisans for insert with check (auth.uid() = owner_id);
create policy "editar mi artesano" on public.artisans for update using (auth.uid() = owner_id);
create policy "borrar mi artesano" on public.artisans for delete using (auth.uid() = owner_id);

create policy "productos públicos" on public.products for select using (true);
create policy "gestionar mis productos" on public.products for all
  using (artisan_id in (select id from public.artisans where owner_id = auth.uid()))
  with check (artisan_id in (select id from public.artisans where owner_id = auth.uid()));

create policy "horarios públicos" on public.market_schedules for select using (true);
create policy "gestionar mis horarios" on public.market_schedules for all
  using (artisan_id in (select id from public.artisans where owner_id = auth.uid()))
  with check (artisan_id in (select id from public.artisans where owner_id = auth.uid()));

create policy "reviews públicas" on public.reviews for select
  using (not hidden or auth.uid() = author_id);
create policy "crear review" on public.reviews for insert
  with check (
    auth.uid() = author_id
    and artisan_id not in (select id from public.artisans where owner_id = auth.uid())
  );
create policy "editar mi review" on public.reviews for update using (auth.uid() = author_id);
create policy "borrar mi review" on public.reviews for delete using (auth.uid() = author_id);

create policy "ver mis solicitudes" on public.verification_requests for select
  using (artisan_id in (select id from public.artisans where owner_id = auth.uid()));
create policy "crear solicitud" on public.verification_requests for insert
  with check (
    artisan_id in (select id from public.artisans where owner_id = auth.uid())
    and status = 'pendiente'
  );

-- ============ PROTECCIÓN DE COLUMNAS ============
-- El artesano NO puede tocar su verification_status ni sus ratings;
-- las reviews solo permiten editar stars y comment (hidden queda para el admin via service role).
revoke update on public.artisans from authenticated, anon;
grant update (slug, shop_name, story, comuna, main_category, profile_photo_url,
              cover_photo_url, instagram_url, facebook_url, whatsapp_phone, contact_email)
  on public.artisans to authenticated;

revoke update on public.reviews from authenticated, anon;
grant update (stars, comment) on public.reviews to authenticated;

revoke update on public.profiles from authenticated, anon;
grant update (display_name, avatar_url) on public.profiles to authenticated;

-- ============ STORAGE ============
insert into storage.buckets (id, name, public) values ('images', 'images', true);
insert into storage.buckets (id, name, public, file_size_limit)
  values ('verification', 'verification', false, 52428800); -- 50 MB

create policy "leer images" on storage.objects for select using (bucket_id = 'images');
create policy "subir a mi carpeta" on storage.objects for insert
  with check (bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "borrar de mi carpeta" on storage.objects for delete
  using (bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "subir verificación propia" on storage.objects for insert
  with check (bucket_id = 'verification' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "ver mi verificación" on storage.objects for select
  using (bucket_id = 'verification' and auth.uid()::text = (storage.foldername(name))[1]);

-- Marcar al dueño como artesano al crear su perfil de emprendimiento (nota de Task 6 del plan)
create function public.mark_owner_as_artisan() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set role = 'artesano' where id = new.owner_id and role = 'comprador';
  return null;
end $$;
create trigger on_artisan_created after insert on public.artisans
  for each row execute function public.mark_owner_as_artisan();
