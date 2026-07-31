# Sólo A Mano — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la vitrina web "Sólo A Mano" para artesanos chilenos de feria: perfiles, catálogo tipo Pinterest, ubicaciones por día, reseñas al artesano y verificación del sello con panel de admin.

**Architecture:** Next.js 15 (App Router, Server Components + Server Actions) con Supabase como backend (Postgres con RLS, Auth con Google/email, Storage para imágenes). Deploy en Vercel. Las mutaciones pasan por server actions con columnas whitelisted; las operaciones de admin usan el service-role client. Correo transaccional con Resend.

**Tech Stack:** Next.js 15, React 19, TypeScript (strict), Tailwind CSS v4, @supabase/ssr + @supabase/supabase-js, browser-image-compression, Resend, Vitest + Testing Library.

## Global Constraints

- Todo el copy visible al usuario en español chileno; nombres de tablas/columnas/código en inglés.
- Paleta exacta: terracota `#C05D3E`, beige claro `#D9C7B8`, crema `#F5EFE6`, café medio `#6E4F3A`, ámbar `#E0A96D`, verde oscuro `#2E3B32`.
- Precios en CLP formateados es-CL (`$12.500`); precio null = "Precio a convenir".
- Máximo 5 fotos por producto; imágenes comprimidas client-side antes de subir (~0.5 MB, 1600px máx).
- Video de verificación ≤ 50 MB o link de YouTube.
- El estado de verificación y los ratings NUNCA son editables por el artesano (column-level grants + service role).
- Correo del admin: `parejavice@gmail.com` (env var `ADMIN_EMAIL`).
- `npm run build` debe pasar sin errores antes de cada commit de cierre de tarea.
- Assets existentes: `assets/logo.png`, `assets/paleta.png`.

## Estructura de archivos final

```
app/
  layout.tsx, page.tsx, globals.css
  explorar/page.tsx
  artesano/[slug]/page.tsx
  producto/[id]/page.tsx
  verificacion/page.tsx
  cuenta/page.tsx, cuenta/callback/route.ts
  panel/layout.tsx, panel/page.tsx, panel/perfil/page.tsx,
  panel/productos/page.tsx, panel/productos/editor/page.tsx,
  panel/ubicaciones/page.tsx, panel/verificacion/page.tsx
  admin/layout.tsx, admin/page.tsx
components/   (Header, Footer, SelloBadge, ProductCard, MasonryGrid, StarRating,
               ReviewSection, ImageUploader, ScheduleWeek, ContactButtons)
actions/      (artisans.ts, products.ts, schedules.ts, reviews.ts, verification.ts, admin.ts, explore.ts)
lib/          (constants.ts, utils.ts, types.ts, upload.ts, supabase/client.ts, supabase/server.ts)
middleware.ts
supabase/schema.sql
tests/        (utils.test.ts, constants.test.ts, components/*.test.tsx)
```

---

### Task 1: Scaffold del proyecto Next.js + identidad visual base

**Files:**
- Create: proyecto Next.js completo en la raíz del repo (create-next-app)
- Modify: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`
- Create: `public/logo.png` (copia de `assets/logo.png`), `components/Header.tsx`, `components/Footer.tsx`

**Interfaces:**
- Produces: tokens de color Tailwind (`bg-crema`, `text-cafe`, `bg-terracota`, `bg-verde`, `text-ambar`, `bg-beige`), fuentes `font-display` (Fraunces) y `font-sans` (Inter), componentes `<Header />` y `<Footer />` usados por todas las páginas.

- [ ] **Step 1: Crear el proyecto**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
```

Nota: el directorio ya tiene `.git`, `assets/` y `docs/` — create-next-app acepta directorios no vacíos con estos contenidos; si pregunta, confirmar. No sobreescribir `assets/` ni `docs/`.

- [ ] **Step 2: Copiar el logo y configurar tokens/fuentes**

```bash
cp assets/logo.png public/logo.png
```

`app/globals.css` completo:

```css
@import "tailwindcss";

@theme {
  --color-terracota: #c05d3e;
  --color-beige: #d9c7b8;
  --color-crema: #f5efe6;
  --color-cafe: #6e4f3a;
  --color-ambar: #e0a96d;
  --color-verde: #2e3b32;
  --font-display: var(--font-fraunces);
  --font-sans: var(--font-inter);
}

body {
  background-color: var(--color-crema);
  color: var(--color-cafe);
}
```

`app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Sólo A Mano — Hecho a mano, hecho con sentido", template: "%s | Sólo A Mano" },
  description:
    "Vitrina de artesanos chilenos de feria: descubre productos hechos a mano, conoce a quienes los hacen y encuéntralos en su próxima feria.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${fraunces.variable} ${inter.variable} font-sans flex min-h-screen flex-col antialiased`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Header y Footer**

`components/Header.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-beige bg-crema/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Sólo A Mano" width={44} height={44} className="rounded-full" />
          <span className="font-display text-xl font-semibold text-cafe">Sólo A Mano</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/explorar" className="hover:text-terracota">Explorar</Link>
          <Link href="/verificacion" className="hover:text-terracota">El sello</Link>
          <Link href="/cuenta" className="rounded-full bg-terracota px-4 py-1.5 text-crema hover:bg-cafe">
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

`components/Footer.tsx`:

```tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-verde text-crema">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:justify-between">
        <p className="font-display">Sólo A Mano — hecho a mano, hecho con sentido.</p>
        <nav className="flex gap-4">
          <Link href="/explorar" className="hover:text-ambar">Explorar</Link>
          <Link href="/verificacion" className="hover:text-ambar">El sello</Link>
          <Link href="/cuenta" className="hover:text-ambar">¿Eres artesano? Súmate</Link>
        </nav>
      </div>
    </footer>
  );
}
```

`app/page.tsx` provisorio (se reemplaza en Task 9):

```tsx
export default function Home() {
  return <p className="p-8 text-center">Sólo A Mano — en construcción.</p>;
}
```

- [ ] **Step 4: Verificar**

Run: `npm run dev` → abrir http://localhost:3000
Expected: fondo crema, header con logo y nav, footer verde. Sin errores en consola.
Run: `npm run build`
Expected: build exitoso.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js con identidad visual base"
```

---

### Task 2: Testing setup + utilidades puras (TDD)

**Files:**
- Create: `vitest.config.ts`, `tests/utils.test.ts`, `tests/constants.test.ts`, `lib/utils.ts`, `lib/constants.ts`
- Modify: `package.json` (script `test`)

**Interfaces:**
- Produces: `formatCLP(price: number | null): string`, `slugify(text: string): string`, `buildWhatsAppLink(phone: string, message: string): string`, `CATEGORIES: {value, label}[]`, `categoryLabel(value: string): string`, `DAYS: {value: 1..7, label}[]`, `dayLabel(value: number): string`.

- [ ] **Step 1: Instalar y configurar Vitest**

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

En `package.json` scripts agregar: `"test": "vitest run"`.

- [ ] **Step 2: Escribir tests que fallan**

`tests/utils.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatCLP, slugify, buildWhatsAppLink } from "@/lib/utils";

describe("formatCLP", () => {
  it("formatea miles con punto es-CL", () => expect(formatCLP(12500)).toBe("$12.500"));
  it("null es precio a convenir", () => expect(formatCLP(null)).toBe("Precio a convenir"));
  it("cero se muestra", () => expect(formatCLP(0)).toBe("$0"));
});

describe("slugify", () => {
  it("quita tildes y espacios", () => expect(slugify("Cuero y Greda Ñuñoa")).toBe("cuero-y-greda-nunoa"));
  it("colapsa símbolos", () => expect(slugify("  ¡Quesos!  del  Sur ")).toBe("quesos-del-sur"));
});

describe("buildWhatsAppLink", () => {
  it("arma link wa.me con 56", () =>
    expect(buildWhatsAppLink("9 1234 5678", "Hola, vi tu puesto")).toBe(
      "https://wa.me/56912345678?text=Hola%2C%20vi%20tu%20puesto"
    ));
  it("no duplica el 56", () =>
    expect(buildWhatsAppLink("+56 9 1234 5678", "Hola")).toBe("https://wa.me/56912345678?text=Hola"));
});
```

`tests/constants.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { CATEGORIES, categoryLabel, DAYS, dayLabel } from "@/lib/constants";

describe("constants", () => {
  it("hay 8 categorías con la de otros al final", () => {
    expect(CATEGORIES).toHaveLength(8);
    expect(CATEGORIES.at(-1)!.value).toBe("otros");
  });
  it("categoryLabel resuelve y cae a Otros", () => {
    expect(categoryLabel("ceramica")).toBe("Cerámica");
    expect(categoryLabel("inexistente")).toBe("Otros");
  });
  it("días 1-7 lunes a domingo", () => {
    expect(DAYS[0]).toEqual({ value: 1, label: "Lunes" });
    expect(dayLabel(7)).toBe("Domingo");
  });
});
```

- [ ] **Step 3: Verificar que fallan**

Run: `npm test`
Expected: FAIL — módulos `@/lib/utils` y `@/lib/constants` no existen.

- [ ] **Step 4: Implementar**

`lib/utils.ts`:

```ts
export function formatCLP(price: number | null): string {
  if (price == null) return "Precio a convenir";
  return "$" + new Intl.NumberFormat("es-CL").format(price);
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("56") ? digits : "56" + digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`;
}
```

Nota: `normalize("NFD")` descompone la ñ en n + virgulilla y la línea siguiente elimina el diacrítico, por eso "Ñuñoa" → "nunoa". El `replace(/ñ/g,...)` es redundante pero inofensivo; mantenerlo como defensa.

`lib/constants.ts`:

```ts
export const CATEGORIES = [
  { value: "carteras_bolsos", label: "Carteras y bolsos" },
  { value: "zapatos_cuero", label: "Zapatos y cuero" },
  { value: "quesos_alimentos", label: "Quesos y alimentos" },
  { value: "ceramica", label: "Cerámica" },
  { value: "tejidos", label: "Tejidos" },
  { value: "joyeria", label: "Joyería" },
  { value: "madera", label: "Madera" },
  { value: "otros", label: "Otros" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? "Otros";
}

export const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
] as const;

export function dayLabel(value: number): string {
  return DAYS.find((d) => d.value === value)?.label ?? "";
}

export const PAGE_SIZE = 24; // productos por página en /explorar
```

- [ ] **Step 5: Verificar que pasan y commit**

Run: `npm test` → Expected: PASS (todos).

```bash
git add -A && git commit -m "feat: utilidades de formato, slug y whatsapp con tests"
```

---

### Task 3: Supabase — proyecto, clients y middleware

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `middleware.ts`, `.env.local`, `.env.example`, `lib/types.ts`
- Modify: `next.config.ts`

**Interfaces:**
- Produces: `createClient()` (browser), `createServerSupabase()` (server components/actions, respeta RLS), `createServiceSupabase()` (service role, solo admin/correo), tipos `Profile`, `Artisan`, `Product`, `MarketSchedule`, `Review`, `VerificationRequest`, `VerificationStatus`.

- [ ] **Step 1: Crear el proyecto en Supabase (manual del usuario)**

En https://supabase.com/dashboard → New project, nombre `solo-a-mano`, región South America (São Paulo). Copiar de Settings → API: `Project URL`, `anon public key`, `service_role key`.

- [ ] **Step 2: Instalar dependencias y env**

```bash
npm i @supabase/supabase-js @supabase/ssr
```

`.env.example` (commitear) y `.env.local` (con valores reales, NO commitear — ya está en .gitignore):

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
ADMIN_EMAIL=parejavice@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 3: Clients**

`lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

`lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { createClient as createBareClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // llamado desde un Server Component: el middleware refresca la sesión
          }
        },
      },
    }
  );
}

/** SOLO para operaciones de admin y correo. Nunca importar desde código cliente. */
export function createServiceSupabase() {
  return createBareClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

`middleware.ts` (raíz):

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (!user && (path.startsWith("/panel") || path.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/cuenta", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)"],
};
```

- [ ] **Step 4: Tipos e imágenes remotas**

`lib/types.ts`:

```ts
import type { Category } from "./constants";

export type VerificationStatus = "no_verificado" | "pendiente" | "verificado" | "rechazado";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: "comprador" | "artesano" | "admin";
}

export interface Artisan {
  id: string;
  owner_id: string;
  slug: string;
  shop_name: string;
  story: string;
  comuna: string;
  main_category: Category;
  profile_photo_url: string | null;
  cover_photo_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  whatsapp_phone: string | null;
  contact_email: string | null;
  verification_status: VerificationStatus;
  rating_avg: number;
  rating_count: number;
}

export interface Product {
  id: string;
  artisan_id: string;
  name: string;
  description: string;
  price_clp: number | null;
  category: Category;
  photo_urls: string[];
  available: boolean;
  created_at: string;
}

export interface MarketSchedule {
  id: string;
  artisan_id: string;
  day_of_week: number; // 1 lunes … 7 domingo
  place_name: string;
  comuna: string;
  time_range: string;
  notes: string;
}

export interface Review {
  id: string;
  artisan_id: string;
  author_id: string;
  stars: number;
  comment: string;
  hidden: boolean;
  created_at: string;
  profiles?: Pick<Profile, "display_name" | "avatar_url">;
}

export interface VerificationRequest {
  id: string;
  artisan_id: string;
  stall_photo_path: string;
  making_photo_path: string;
  video_path: string | null;
  video_url: string | null;
  message: string;
  status: "pendiente" | "aprobada" | "rechazada";
  admin_comment: string;
  created_at: string;
}
```

En `next.config.ts` permitir imágenes de Supabase:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
```

- [ ] **Step 5: Verificar y commit**

Run: `npm run build` → Expected: build exitoso.

```bash
git add -A && git commit -m "feat: clients de Supabase, middleware de sesion y tipos"
```

---

### Task 4: Esquema de base de datos, RLS, triggers y buckets

**Files:**
- Create: `supabase/schema.sql`

**Interfaces:**
- Produces: tablas `profiles`, `artisans`, `products`, `market_schedules`, `reviews`, `verification_requests`; buckets `images` (público) y `verification` (privado); trigger de perfil automático, trigger de rating, trigger de sync de verificación. Los nombres de columnas son exactamente los de `lib/types.ts`.

- [ ] **Step 1: Escribir `supabase/schema.sql`**

```sql
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

create policy "reviews públicas" on public.reviews for select using (true);
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
```

- [ ] **Step 2: Aplicar el esquema**

En el dashboard de Supabase → SQL Editor → pegar `supabase/schema.sql` completo → Run.
Expected: "Success. No rows returned".

- [ ] **Step 3: Verificar RLS con queries de prueba**

En SQL Editor:

```sql
select tablename, rowsecurity from pg_tables where schemaname = 'public';
```

Expected: las 6 tablas con `rowsecurity = true`.

```sql
insert into public.artisans (owner_id, slug, shop_name) values (gen_random_uuid(), 'x', 'X');
```

Expected: ERROR de foreign key (no existe el profile) — confirma integridad referencial.

- [ ] **Step 4: Commit**

```bash
git add supabase && git commit -m "feat: esquema completo con RLS, triggers y buckets"
```

---

### Task 5: Autenticación — /cuenta, callback y header con sesión

**Files:**
- Create: `app/cuenta/page.tsx`, `app/cuenta/AuthForm.tsx`, `app/cuenta/callback/route.ts`, `actions/auth.ts`
- Modify: `components/Header.tsx`

**Interfaces:**
- Consumes: `createClient()` de Task 3.
- Produces: flujo login/registro completo; `signOut()` server action; Header muestra "Entrar" o "Mi panel" + "Salir" según sesión.

- [ ] **Step 1: Configurar Google OAuth (manual del usuario)**

Supabase dashboard → Authentication → Providers → Google → habilitar. Crear credenciales OAuth en Google Cloud Console (tipo Web), authorized redirect URI: `https://TU-PROYECTO.supabase.co/auth/v1/callback`. Pegar Client ID y Secret en Supabase. En Authentication → URL Configuration, agregar `http://localhost:3000/cuenta/callback` y (después del deploy) `https://TU-DOMINIO.vercel.app/cuenta/callback` a Redirect URLs.

- [ ] **Step 2: Página de cuenta con formulario**

`app/cuenta/AuthForm.tsx` (client component):

```tsx
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function withGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/cuenta/callback` },
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (mode === "registro") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) setError("No pudimos crear tu cuenta: " + error.message);
      else setNotice("Revisa tu correo para confirmar tu cuenta.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Correo o contraseña incorrectos.");
      else location.href = "/panel";
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-sm rounded-2xl border border-beige bg-white/60 p-6">
      <h1 className="font-display text-2xl">{mode === "login" ? "Entrar" : "Crear cuenta"}</h1>
      <button onClick={withGoogle} className="mt-4 w-full rounded-full border border-cafe py-2 hover:bg-beige">
        Continuar con Google
      </button>
      <div className="my-4 text-center text-xs text-cafe/60">o con tu correo</div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {mode === "registro" && (
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre"
            className="rounded-lg border border-beige bg-crema px-3 py-2" />
        )}
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo"
          className="rounded-lg border border-beige bg-crema px-3 py-2" />
        <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña (mínimo 8)" className="rounded-lg border border-beige bg-crema px-3 py-2" />
        {error && <p className="text-sm text-terracota">{error}</p>}
        {notice && <p className="text-sm text-verde">{notice}</p>}
        <button disabled={loading} className="rounded-full bg-terracota py-2 text-crema hover:bg-cafe disabled:opacity-50">
          {mode === "login" ? "Entrar" : "Registrarme"}
        </button>
      </form>
      <button onClick={() => setMode(mode === "login" ? "registro" : "login")}
        className="mt-4 w-full text-center text-sm underline">
        {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Entra"}
      </button>
    </div>
  );
}
```

`app/cuenta/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import AuthForm from "./AuthForm";

export const metadata = { title: "Entrar" };

export default async function CuentaPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/panel");
  return <AuthForm />;
}
```

`app/cuenta/callback/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createServerSupabase();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}/panel`);
}
```

- [ ] **Step 3: Logout y header con sesión**

`actions/auth.ts`:

```ts
"use server";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
```

En `components/Header.tsx`, convertir en async server component: obtener el usuario con `createServerSupabase()` y reemplazar el link "Entrar":

```tsx
import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";

export default async function Header() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-beige bg-crema/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Sólo A Mano" width={44} height={44} className="rounded-full" />
          <span className="font-display text-xl font-semibold text-cafe">Sólo A Mano</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/explorar" className="hover:text-terracota">Explorar</Link>
          <Link href="/verificacion" className="hover:text-terracota">El sello</Link>
          {user ? (
            <>
              <Link href="/panel" className="rounded-full bg-terracota px-4 py-1.5 text-crema hover:bg-cafe">
                Mi panel
              </Link>
              <form action={signOut}>
                <button className="hover:text-terracota">Salir</button>
              </form>
            </>
          ) : (
            <Link href="/cuenta" className="rounded-full bg-terracota px-4 py-1.5 text-crema hover:bg-cafe">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Verificar manualmente**

Run: `npm run dev`
- Registrarse con email → llega correo de confirmación → confirmar → entrar → header muestra "Mi panel" y "Salir" (el /panel dará 404, se crea en Task 6 — OK).
- En Supabase → Table Editor → `profiles`: existe la fila con `display_name`.
- "Salir" vuelve al estado anónimo. Login con Google funciona.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: autenticacion con Google y email"
```

---

### Task 6: Panel del artesano — crear y editar perfil

**Files:**
- Create: `app/panel/layout.tsx`, `app/panel/page.tsx`, `app/panel/perfil/page.tsx`, `app/panel/perfil/ProfileForm.tsx`, `actions/artisans.ts`, `lib/upload.ts`, `components/ImageUploader.tsx`, `components/SelloBadge.tsx`
- Test: `tests/components/SelloBadge.test.tsx`

**Interfaces:**
- Consumes: `createServerSupabase`, `slugify`, `CATEGORIES`, tipos `Artisan`.
- Produces: `saveArtisanProfile(formData: FormData): Promise<{ error?: string }>` (crea o actualiza; genera slug único; setea `profiles.role = 'artesano'`); `uploadImage(file: File, folder: string): Promise<string>` (comprime y sube a bucket `images`, retorna URL pública); `<ImageUploader name label defaultUrl />` (input de archivo con preview que sube y guarda la URL en un hidden input); `<SelloBadge status size? />`.

- [ ] **Step 1: Test del SelloBadge (falla primero)**

`tests/components/SelloBadge.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SelloBadge from "@/components/SelloBadge";

describe("SelloBadge", () => {
  it("muestra el sello cuando está verificado", () => {
    render(<SelloBadge status="verificado" />);
    expect(screen.getByText("Sello Sólo A Mano")).toBeDefined();
  });
  it("no renderiza nada en otros estados", () => {
    const { container } = render(<SelloBadge status="pendiente" />);
    expect(container.innerHTML).toBe("");
  });
});
```

Run: `npm test` → Expected: FAIL (componente no existe).

- [ ] **Step 2: Implementar SelloBadge y verificar test**

`components/SelloBadge.tsx`:

```tsx
import type { VerificationStatus } from "@/lib/types";

export default function SelloBadge({ status, size = "sm" }: { status: VerificationStatus; size?: "sm" | "lg" }) {
  if (status !== "verificado") return null;
  const cls = size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-terracota font-medium text-crema ${cls}`}
      title="Emprendimiento verificado: vende únicamente productos hechos a mano">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path d="M12 2l2.4 2.4 3.4-.5.5 3.4L20.7 9l-1.6 3 1.6 3-2.4 1.7-.5 3.4-3.4-.5L12 22l-2.4-2.4-3.4.5-.5-3.4L3.3 15l1.6-3-1.6-3 2.4-1.7.5-3.4 3.4.5L12 2zm-1.2 13l5-5-1.4-1.4-3.6 3.6-1.6-1.6L7.8 12l3 3z" />
      </svg>
      Sello Sólo A Mano
    </span>
  );
}
```

Run: `npm test` → Expected: PASS.

- [ ] **Step 3: Subida de imágenes**

```bash
npm i browser-image-compression
```

`lib/upload.ts`:

```ts
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

export async function uploadImage(file: File, folder: string): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión");
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/jpeg",
  });
  const path = `${user.id}/${folder}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("images").upload(path, compressed, { contentType: "image/jpeg" });
  if (error) throw new Error("No pudimos subir la imagen: " + error.message);
  return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
}
```

`components/ImageUploader.tsx`:

```tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/upload";

export default function ImageUploader({
  name, label, folder, defaultUrl,
}: { name: string; label: string; folder: string; defaultUrl?: string | null }) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setUrl(await uploadImage(file, folder));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input type="hidden" name={name} value={url} />
      {url && <Image src={url} alt={label} width={160} height={160} className="rounded-xl object-cover" />}
      <input type="file" accept="image/*" onChange={onChange} disabled={busy}
        className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-beige file:px-3 file:py-1.5" />
      {busy && <p className="text-xs text-cafe/60">Subiendo…</p>}
      {error && <p className="text-xs text-terracota">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Server action del perfil**

`actions/artisans.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";

export async function saveArtisanProfile(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const shopName = String(formData.get("shop_name") ?? "").trim();
  if (shopName.length < 3) return { error: "El nombre del emprendimiento necesita al menos 3 letras." };
  const category = String(formData.get("main_category"));
  if (!CATEGORIES.some((c) => c.value === category)) return { error: "Categoría inválida." };

  const fields = {
    shop_name: shopName,
    story: String(formData.get("story") ?? "").trim(),
    comuna: String(formData.get("comuna") ?? "").trim(),
    main_category: category,
    profile_photo_url: String(formData.get("profile_photo_url") ?? "") || null,
    cover_photo_url: String(formData.get("cover_photo_url") ?? "") || null,
    instagram_url: String(formData.get("instagram_url") ?? "").trim() || null,
    facebook_url: String(formData.get("facebook_url") ?? "").trim() || null,
    whatsapp_phone: String(formData.get("whatsapp_phone") ?? "").trim() || null,
    contact_email: String(formData.get("contact_email") ?? "").trim() || null,
  };

  const { data: existing } = await supabase.from("artisans").select("id, slug").eq("owner_id", user.id).maybeSingle();

  if (existing) {
    const { error } = await supabase.from("artisans").update(fields).eq("id", existing.id);
    if (error) return { error: "No pudimos guardar: " + error.message };
    revalidatePath(`/artesano/${existing.slug}`);
  } else {
    let slug = slugify(shopName);
    const { data: clash } = await supabase.from("artisans").select("id").eq("slug", slug).maybeSingle();
    if (clash) slug = `${slug}-${crypto.randomUUID().slice(0, 4)}`;
    const { error } = await supabase.from("artisans").insert({ ...fields, owner_id: user.id, slug });
    if (error) return { error: "No pudimos crear tu perfil: " + error.message };
    await supabase.from("profiles").update({ display_name: shopName }).eq("id", user.id);
  }
  revalidatePath("/panel");
  return {};
}
```

Nota: el rol `artesano` en `profiles.role` es informativo; como `role` no está en el grant de update, se setea vía trigger simple — agregar al final de `supabase/schema.sql` y correr en SQL Editor:

```sql
create function public.mark_owner_as_artisan() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set role = 'artesano' where id = new.owner_id and role = 'comprador';
  return null;
end $$;
create trigger on_artisan_created after insert on public.artisans
  for each row execute function public.mark_owner_as_artisan();
```

- [ ] **Step 5: Páginas del panel**

`app/panel/layout.tsx`:

```tsx
import Link from "next/link";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-6 flex flex-wrap gap-3 text-sm">
        <Link href="/panel" className="rounded-full border border-beige px-3 py-1 hover:bg-beige">Resumen</Link>
        <Link href="/panel/perfil" className="rounded-full border border-beige px-3 py-1 hover:bg-beige">Mi perfil</Link>
        <Link href="/panel/productos" className="rounded-full border border-beige px-3 py-1 hover:bg-beige">Productos</Link>
        <Link href="/panel/ubicaciones" className="rounded-full border border-beige px-3 py-1 hover:bg-beige">Ubicaciones</Link>
        <Link href="/panel/verificacion" className="rounded-full border border-beige px-3 py-1 hover:bg-beige">Verificación</Link>
      </nav>
      {children}
    </div>
  );
}
```

`app/panel/page.tsx`:

```tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import SelloBadge from "@/components/SelloBadge";
import type { Artisan } from "@/lib/types";

export const metadata = { title: "Mi panel" };

export default async function PanelPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: artisan } = await supabase
    .from("artisans").select("*").eq("owner_id", user!.id).maybeSingle<Artisan>();

  if (!artisan) {
    return (
      <div className="rounded-2xl border border-beige bg-white/60 p-8 text-center">
        <h1 className="font-display text-2xl">¡Bienvenido a Sólo A Mano!</h1>
        <p className="mt-2">Aún no tienes un perfil de emprendimiento. Créalo para mostrar tus productos.</p>
        <Link href="/panel/perfil" className="mt-4 inline-block rounded-full bg-terracota px-6 py-2 text-crema">
          Crear mi perfil de artesano
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-3xl">{artisan.shop_name}</h1>
        <SelloBadge status={artisan.verification_status} />
      </div>
      <p className="mt-1 text-sm text-cafe/70">
        Tu página pública: <Link className="underline" href={`/artesano/${artisan.slug}`}>/artesano/{artisan.slug}</Link>
      </p>
    </div>
  );
}
```

`app/panel/perfil/page.tsx`:

```tsx
import { createServerSupabase } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import type { Artisan } from "@/lib/types";

export const metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: artisan } = await supabase
    .from("artisans").select("*").eq("owner_id", user!.id).maybeSingle<Artisan>();
  return <ProfileForm artisan={artisan} />;
}
```

`app/panel/perfil/ProfileForm.tsx`:

```tsx
"use client";
import { useState, useTransition } from "react";
import { saveArtisanProfile } from "@/actions/artisans";
import { CATEGORIES } from "@/lib/constants";
import ImageUploader from "@/components/ImageUploader";
import type { Artisan } from "@/lib/types";

const input = "rounded-lg border border-beige bg-crema px-3 py-2 w-full";

export default function ProfileForm({ artisan }: { artisan: Artisan | null }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(formData: FormData) {
    start(async () => {
      setSaved(false);
      const res = await saveArtisanProfile(formData);
      if (res.error) setError(res.error);
      else { setError(null); setSaved(true); }
    });
  }

  return (
    <form action={onSubmit} className="flex max-w-2xl flex-col gap-4">
      <h1 className="font-display text-2xl">{artisan ? "Editar mi perfil" : "Crear mi perfil de artesano"}</h1>
      <label className="text-sm font-medium">Nombre del emprendimiento *
        <input name="shop_name" required minLength={3} defaultValue={artisan?.shop_name} className={input} />
      </label>
      <label className="text-sm font-medium">Tu historia
        <textarea name="story" rows={4} defaultValue={artisan?.story} className={input}
          placeholder="Cuéntanos qué haces, cómo partiste, qué hace especial lo tuyo…" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Comuna
          <input name="comuna" defaultValue={artisan?.comuna} placeholder="Ñuñoa" className={input} />
        </label>
        <label className="text-sm font-medium">Categoría principal *
          <select name="main_category" defaultValue={artisan?.main_category ?? "otros"} className={input}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUploader name="profile_photo_url" label="Foto de perfil" folder="perfil" defaultUrl={artisan?.profile_photo_url} />
        <ImageUploader name="cover_photo_url" label="Foto de portada" folder="portada" defaultUrl={artisan?.cover_photo_url} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">WhatsApp
          <input name="whatsapp_phone" defaultValue={artisan?.whatsapp_phone ?? ""} placeholder="9 1234 5678" className={input} />
        </label>
        <label className="text-sm font-medium">Correo de contacto
          <input name="contact_email" type="email" defaultValue={artisan?.contact_email ?? ""} className={input} />
        </label>
        <label className="text-sm font-medium">Instagram (URL)
          <input name="instagram_url" type="url" defaultValue={artisan?.instagram_url ?? ""}
            placeholder="https://instagram.com/tu_cuenta" className={input} />
        </label>
        <label className="text-sm font-medium">Facebook (URL)
          <input name="facebook_url" type="url" defaultValue={artisan?.facebook_url ?? ""} className={input} />
        </label>
      </div>
      {error && <p className="text-sm text-terracota">{error}</p>}
      {saved && <p className="text-sm text-verde">Guardado ✓</p>}
      <button disabled={pending} className="w-fit rounded-full bg-terracota px-6 py-2 text-crema disabled:opacity-50">
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
```

- [ ] **Step 6: Verificar y commit**

Run: `npm test` → PASS. `npm run dev` → con sesión iniciada, crear perfil con fotos → aparece en Table Editor `artisans` con slug correcto; `profiles.role` cambió a `artesano`; editar y guardar funciona; sin sesión, `/panel` redirige a `/cuenta`.

```bash
git add -A && git commit -m "feat: panel de artesano con creacion y edicion de perfil"
```

---

### Task 7: Panel — CRUD de productos con fotos

**Files:**
- Create: `app/panel/productos/page.tsx`, `app/panel/productos/editor/page.tsx`, `app/panel/productos/editor/ProductForm.tsx`, `actions/products.ts`, `components/MultiImageUploader.tsx`

**Interfaces:**
- Consumes: `uploadImage`, `CATEGORIES`, `formatCLP`, tipos `Product`.
- Produces: `saveProduct(formData): Promise<{ error?: string }>` (campo `id` vacío = crear), `deleteProduct(id: string)`, `toggleAvailable(id: string, available: boolean)`; `<MultiImageUploader name defaultUrls max={5} />` que guarda un JSON array de URLs en un hidden input.

- [ ] **Step 1: Server actions**

`actions/products.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";

async function myArtisanId() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, artisanId: null };
  const { data } = await supabase.from("artisans").select("id").eq("owner_id", user.id).maybeSingle();
  return { supabase, artisanId: data?.id ?? null };
}

export async function saveProduct(formData: FormData): Promise<{ error?: string }> {
  const { supabase, artisanId } = await myArtisanId();
  if (!artisanId) return { error: "Primero crea tu perfil de artesano." };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "El producto necesita un nombre." };
  const category = String(formData.get("category"));
  if (!CATEGORIES.some((c) => c.value === category)) return { error: "Categoría inválida." };

  let photos: string[] = [];
  try { photos = JSON.parse(String(formData.get("photo_urls") ?? "[]")); } catch { /* queda vacío */ }
  if (photos.length > 5) photos = photos.slice(0, 5);

  const priceRaw = String(formData.get("price_clp") ?? "").replace(/\D/g, "");
  const fields = {
    name,
    description: String(formData.get("description") ?? "").trim(),
    price_clp: priceRaw ? parseInt(priceRaw, 10) : null,
    category,
    photo_urls: photos,
  };

  const id = String(formData.get("id") ?? "");
  const { error } = id
    ? await supabase.from("products").update(fields).eq("id", id).eq("artisan_id", artisanId)
    : await supabase.from("products").insert({ ...fields, artisan_id: artisanId });
  if (error) return { error: "No pudimos guardar el producto: " + error.message };
  revalidatePath("/panel/productos");
  revalidatePath("/explorar");
  return {};
}

export async function deleteProduct(id: string): Promise<void> {
  const { supabase, artisanId } = await myArtisanId();
  if (!artisanId) return;
  await supabase.from("products").delete().eq("id", id).eq("artisan_id", artisanId);
  revalidatePath("/panel/productos");
}

export async function toggleAvailable(id: string, available: boolean): Promise<void> {
  const { supabase, artisanId } = await myArtisanId();
  if (!artisanId) return;
  await supabase.from("products").update({ available }).eq("id", id).eq("artisan_id", artisanId);
  revalidatePath("/panel/productos");
}
```

- [ ] **Step 2: MultiImageUploader**

`components/MultiImageUploader.tsx`:

```tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/upload";

export default function MultiImageUploader({
  name, defaultUrls = [], max = 5,
}: { name: string; defaultUrls?: string[]; max?: number }) {
  const [urls, setUrls] = useState<string[]>(defaultUrls);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (urls.length + files.length > max) {
      setError(`Máximo ${max} fotos por producto.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const nuevos = [];
      for (const f of files) nuevos.push(await uploadImage(f, "productos"));
      setUrls([...urls, ...nuevos]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Fotos (hasta {max})</label>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div className="flex flex-wrap gap-2">
        {urls.map((u, i) => (
          <div key={u} className="relative">
            <Image src={u} alt={`Foto ${i + 1}`} width={96} height={96} className="h-24 w-24 rounded-lg object-cover" />
            <button type="button" onClick={() => setUrls(urls.filter((x) => x !== u))}
              className="absolute -right-1 -top-1 rounded-full bg-terracota px-1.5 text-xs text-crema">✕</button>
          </div>
        ))}
      </div>
      {urls.length < max && (
        <input type="file" accept="image/*" multiple onChange={onChange} disabled={busy}
          className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-beige file:px-3 file:py-1.5" />
      )}
      {busy && <p className="text-xs text-cafe/60">Subiendo…</p>}
      {error && <p className="text-xs text-terracota">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Lista y formulario**

`app/panel/productos/page.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { deleteProduct, toggleAvailable } from "@/actions/products";
import { formatCLP } from "@/lib/utils";
import type { Product } from "@/lib/types";

export const metadata = { title: "Mis productos" };

export default async function ProductosPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: artisan } = await supabase.from("artisans").select("id").eq("owner_id", user!.id).maybeSingle();
  if (!artisan) return <p>Primero <Link className="underline" href="/panel/perfil">crea tu perfil</Link>.</p>;

  const { data: products } = await supabase
    .from("products").select("*").eq("artisan_id", artisan.id)
    .order("created_at", { ascending: false }).returns<Product[]>();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Mis productos</h1>
        <Link href="/panel/productos/editor" className="rounded-full bg-terracota px-4 py-1.5 text-sm text-crema">
          + Nuevo producto
        </Link>
      </div>
      {!products?.length && <p className="text-cafe/70">Aún no tienes productos. ¡Sube el primero!</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {products?.map((p) => (
          <li key={p.id} className="flex gap-3 rounded-xl border border-beige bg-white/60 p-3">
            {p.photo_urls[0]
              ? <Image src={p.photo_urls[0]} alt={p.name} width={80} height={80} className="h-20 w-20 rounded-lg object-cover" />
              : <div className="h-20 w-20 rounded-lg bg-beige" />}
            <div className="flex-1">
              <p className="font-medium">{p.name} {!p.available && <span className="text-xs text-terracota">(agotado)</span>}</p>
              <p className="text-sm text-cafe/70">{formatCLP(p.price_clp)}</p>
              <div className="mt-1 flex gap-3 text-xs">
                <Link href={`/panel/productos/editor?id=${p.id}`} className="underline">Editar</Link>
                <form action={toggleAvailable.bind(null, p.id, !p.available)}>
                  <button className="underline">{p.available ? "Marcar agotado" : "Marcar disponible"}</button>
                </form>
                <form action={deleteProduct.bind(null, p.id)}>
                  <button className="text-terracota underline">Eliminar</button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

`app/panel/productos/editor/page.tsx`:

```tsx
import { createServerSupabase } from "@/lib/supabase/server";
import ProductForm from "./ProductForm";
import type { Product } from "@/lib/types";

export const metadata = { title: "Editor de producto" };

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  let product: Product | null = null;
  if (id) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle<Product>();
    product = data;
  }
  return <ProductForm product={product} />;
}
```

`app/panel/productos/editor/ProductForm.tsx`:

```tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProduct } from "@/actions/products";
import { CATEGORIES } from "@/lib/constants";
import MultiImageUploader from "@/components/MultiImageUploader";
import type { Product } from "@/lib/types";

const input = "rounded-lg border border-beige bg-crema px-3 py-2 w-full";

export default function ProductForm({ product }: { product: Product | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    start(async () => {
      const res = await saveProduct(formData);
      if (res.error) setError(res.error);
      else router.push("/panel/productos");
    });
  }

  return (
    <form action={onSubmit} className="flex max-w-xl flex-col gap-4">
      <h1 className="font-display text-2xl">{product ? "Editar producto" : "Nuevo producto"}</h1>
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <label className="text-sm font-medium">Nombre *
        <input name="name" required minLength={2} defaultValue={product?.name} className={input} />
      </label>
      <label className="text-sm font-medium">Descripción
        <textarea name="description" rows={3} defaultValue={product?.description} className={input} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Precio referencial (CLP)
          <input name="price_clp" inputMode="numeric" defaultValue={product?.price_clp ?? ""}
            placeholder="Vacío = precio a convenir" className={input} />
        </label>
        <label className="text-sm font-medium">Categoría *
          <select name="category" defaultValue={product?.category ?? "otros"} className={input}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
      </div>
      <MultiImageUploader name="photo_urls" defaultUrls={product?.photo_urls} max={5} />
      {error && <p className="text-sm text-terracota">{error}</p>}
      <button disabled={pending} className="w-fit rounded-full bg-terracota px-6 py-2 text-crema disabled:opacity-50">
        {pending ? "Guardando…" : "Guardar producto"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Verificar y commit**

Run: `npm run dev` → crear producto con 3 fotos → aparece en la lista con precio formateado; editar, marcar agotado y eliminar funcionan; intentar 6 fotos muestra el error de máximo.

```bash
git add -A && git commit -m "feat: CRUD de productos con fotos comprimidas"
```

---

### Task 8: Panel — ubicaciones frecuentes (semana de ferias)

**Files:**
- Create: `app/panel/ubicaciones/page.tsx`, `app/panel/ubicaciones/ScheduleManager.tsx`, `actions/schedules.ts`, `components/ScheduleWeek.tsx`
- Test: `tests/components/ScheduleWeek.test.tsx`

**Interfaces:**
- Consumes: `DAYS`, `dayLabel`, tipos `MarketSchedule`.
- Produces: `addSchedule(formData): Promise<{ error?: string }>`, `deleteSchedule(id: string)`; `<ScheduleWeek schedules />` (server-safe, ordena por día y muestra "Martes → Plaza Ñuñoa · 10:00–14:00"), reutilizado en el perfil público (Task 11).

- [ ] **Step 1: Test de ScheduleWeek (falla primero)**

`tests/components/ScheduleWeek.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ScheduleWeek from "@/components/ScheduleWeek";
import type { MarketSchedule } from "@/lib/types";

const base = { id: "1", artisan_id: "a", comuna: "", time_range: "", notes: "" };

describe("ScheduleWeek", () => {
  it("ordena por día de la semana", () => {
    const schedules: MarketSchedule[] = [
      { ...base, id: "1", day_of_week: 6, place_name: "Feria del Parque" },
      { ...base, id: "2", day_of_week: 2, place_name: "Plaza Ñuñoa" },
    ];
    render(<ScheduleWeek schedules={schedules} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0].textContent).toContain("Martes");
    expect(items[1].textContent).toContain("Sábado");
  });
  it("mensaje vacío cuando no hay ubicaciones", () => {
    render(<ScheduleWeek schedules={[]} />);
    expect(screen.getByText(/sin ubicaciones/i)).toBeDefined();
  });
});
```

Run: `npm test` → Expected: FAIL.

- [ ] **Step 2: Implementar ScheduleWeek**

`components/ScheduleWeek.tsx`:

```tsx
import { dayLabel } from "@/lib/constants";
import type { MarketSchedule } from "@/lib/types";

export default function ScheduleWeek({ schedules }: { schedules: MarketSchedule[] }) {
  if (!schedules.length) return <p className="text-sm text-cafe/60">Sin ubicaciones frecuentes por ahora.</p>;
  const sorted = [...schedules].sort((a, b) => a.day_of_week - b.day_of_week);
  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((s) => (
        <li key={s.id} className="flex flex-wrap items-baseline gap-x-2 rounded-lg bg-white/60 px-3 py-2">
          <span className="font-medium text-terracota">{dayLabel(s.day_of_week)}</span>
          <span>→ {s.place_name}</span>
          {s.comuna && <span className="text-sm text-cafe/70">({s.comuna})</span>}
          {s.time_range && <span className="text-sm text-cafe/70">· {s.time_range}</span>}
          {s.notes && <span className="w-full text-xs text-cafe/60">{s.notes}</span>}
        </li>
      ))}
    </ul>
  );
}
```

Run: `npm test` → Expected: PASS.

- [ ] **Step 3: Actions y página**

`actions/schedules.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function addSchedule(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };
  const { data: artisan } = await supabase.from("artisans").select("id").eq("owner_id", user.id).maybeSingle();
  if (!artisan) return { error: "Primero crea tu perfil de artesano." };

  const day = parseInt(String(formData.get("day_of_week")), 10);
  const place = String(formData.get("place_name") ?? "").trim();
  if (!place) return { error: "Indica el nombre de la feria o lugar." };
  if (!(day >= 1 && day <= 7)) return { error: "Día inválido." };

  const { error } = await supabase.from("market_schedules").insert({
    artisan_id: artisan.id,
    day_of_week: day,
    place_name: place,
    comuna: String(formData.get("comuna") ?? "").trim(),
    time_range: String(formData.get("time_range") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  });
  if (error) return { error: "No pudimos guardar: " + error.message };
  revalidatePath("/panel/ubicaciones");
  return {};
}

export async function deleteSchedule(id: string): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.from("market_schedules").delete().eq("id", id); // RLS limita a los propios
  revalidatePath("/panel/ubicaciones");
}
```

`app/panel/ubicaciones/page.tsx`:

```tsx
import { createServerSupabase } from "@/lib/supabase/server";
import ScheduleManager from "./ScheduleManager";
import type { MarketSchedule } from "@/lib/types";

export const metadata = { title: "Mis ubicaciones" };

export default async function UbicacionesPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: artisan } = await supabase.from("artisans").select("id").eq("owner_id", user!.id).maybeSingle();
  const { data: schedules } = artisan
    ? await supabase.from("market_schedules").select("*").eq("artisan_id", artisan.id).returns<MarketSchedule[]>()
    : { data: [] as MarketSchedule[] };
  return <ScheduleManager schedules={schedules ?? []} hasArtisan={!!artisan} />;
}
```

`app/panel/ubicaciones/ScheduleManager.tsx`:

```tsx
"use client";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { addSchedule, deleteSchedule } from "@/actions/schedules";
import { DAYS } from "@/lib/constants";
import ScheduleWeek from "@/components/ScheduleWeek";
import type { MarketSchedule } from "@/lib/types";

const input = "rounded-lg border border-beige bg-crema px-3 py-2 w-full";

export default function ScheduleManager({ schedules, hasArtisan }: { schedules: MarketSchedule[]; hasArtisan: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!hasArtisan) return <p>Primero <Link className="underline" href="/panel/perfil">crea tu perfil</Link>.</p>;

  function onSubmit(formData: FormData) {
    start(async () => {
      const res = await addSchedule(formData);
      if (res.error) setError(res.error);
      else { setError(null); formRef.current?.reset(); }
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl">Mi semana de ferias</h1>
        <p className="text-sm text-cafe/70">Cuéntale a tus clientes dónde encontrarte cada semana.</p>
      </div>
      <div className="flex flex-col gap-2">
        <ScheduleWeek schedules={schedules} />
        {schedules.map((s) => (
          <form key={s.id} action={() => start(() => deleteSchedule(s.id))}>
            <button className="text-xs text-terracota underline">Quitar {s.place_name}</button>
          </form>
        ))}
      </div>
      <form ref={formRef} action={onSubmit} className="flex flex-col gap-3 rounded-2xl border border-beige bg-white/60 p-4">
        <h2 className="font-medium">Agregar ubicación</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Día
            <select name="day_of_week" className={input}>
              {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label className="text-sm">Lugar *
            <input name="place_name" required placeholder="Plaza Ñuñoa" className={input} />
          </label>
          <label className="text-sm">Comuna
            <input name="comuna" placeholder="Ñuñoa" className={input} />
          </label>
          <label className="text-sm">Horario
            <input name="time_range" placeholder="10:00–14:00" className={input} />
          </label>
        </div>
        <label className="text-sm">Notas
          <input name="notes" placeholder="Solo la feria navideña de diciembre" className={input} />
        </label>
        {error && <p className="text-sm text-terracota">{error}</p>}
        <button disabled={pending} className="w-fit rounded-full bg-terracota px-5 py-1.5 text-sm text-crema disabled:opacity-50">
          Agregar
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Verificar y commit**

Run: `npm test` → PASS. `npm run dev` → agregar "Martes / Plaza Ñuñoa / 10:00–14:00" y un sábado → se listan ordenados por día; quitar funciona.

```bash
git add -A && git commit -m "feat: ubicaciones frecuentes por dia de semana"
```

---

### Task 9: Página de inicio

**Files:**
- Modify: `app/page.tsx`
- Create: `components/ProductCard.tsx`
- Test: `tests/components/ProductCard.test.tsx`

**Interfaces:**
- Consumes: `formatCLP`, `categoryLabel`, `SelloBadge`, tipos.
- Produces: `<ProductCard product artisan />` con `product: Pick<Product,"id"|"name"|"price_clp"|"photo_urls">` y `artisan: { slug, shop_name, verification_status }` — reutilizada por inicio y explorar.

- [ ] **Step 1: Test de ProductCard (falla primero)**

`tests/components/ProductCard.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProductCard from "@/components/ProductCard";

const artisan = { slug: "cuero-sur", shop_name: "Cuero del Sur", verification_status: "verificado" as const };

describe("ProductCard", () => {
  it("muestra nombre, precio formateado y artesano", () => {
    render(<ProductCard product={{ id: "p1", name: "Cartera café", price_clp: 25000, photo_urls: [] }} artisan={artisan} />);
    expect(screen.getByText("Cartera café")).toBeDefined();
    expect(screen.getByText("$25.000")).toBeDefined();
    expect(screen.getByText("Cuero del Sur")).toBeDefined();
  });
  it("precio a convenir cuando es null", () => {
    render(<ProductCard product={{ id: "p2", name: "Queso", price_clp: null, photo_urls: [] }} artisan={artisan} />);
    expect(screen.getByText("Precio a convenir")).toBeDefined();
  });
});
```

Run: `npm test` → Expected: FAIL.

- [ ] **Step 2: Implementar ProductCard**

`components/ProductCard.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import { formatCLP } from "@/lib/utils";
import type { Product, VerificationStatus } from "@/lib/types";

type CardProduct = Pick<Product, "id" | "name" | "price_clp" | "photo_urls">;
type CardArtisan = { slug: string; shop_name: string; verification_status: VerificationStatus };

export default function ProductCard({ product, artisan }: { product: CardProduct; artisan: CardArtisan }) {
  return (
    <div className="break-inside-avoid overflow-hidden rounded-2xl border border-beige bg-white/70 transition hover:shadow-md">
      <Link href={`/producto/${product.id}`}>
        {product.photo_urls[0]
          ? <Image src={product.photo_urls[0]} alt={product.name} width={480} height={480}
              className="w-full object-cover" />
          : <div className="flex aspect-square w-full items-center justify-center bg-beige text-cafe/40">Sin foto</div>}
      </Link>
      <div className="p-3">
        <Link href={`/producto/${product.id}`} className="font-medium hover:text-terracota">{product.name}</Link>
        <p className="text-sm text-cafe/80">{formatCLP(product.price_clp)}</p>
        <Link href={`/artesano/${artisan.slug}`}
          className="mt-1 flex items-center gap-1 text-xs text-cafe/60 hover:text-terracota">
          <span>{artisan.shop_name}</span>
          {artisan.verification_status === "verificado" && (
            <span className="text-terracota" title="Sello Sólo A Mano">✓</span>
          )}
        </Link>
      </div>
    </div>
  );
}
```

Run: `npm test` → Expected: PASS.

- [ ] **Step 3: Página de inicio**

`app/page.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";
import SelloBadge from "@/components/SelloBadge";
import type { Artisan } from "@/lib/types";

export default async function Home() {
  const supabase = await createServerSupabase();
  const { data: featured } = await supabase
    .from("artisans").select("*").eq("verification_status", "verificado")
    .order("rating_avg", { ascending: false }).limit(4).returns<Artisan[]>();

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-center gap-4 py-16 text-center">
        <Image src="/logo.png" alt="Sólo A Mano" width={140} height={140} className="rounded-full" />
        <h1 className="font-display text-4xl sm:text-5xl">Hecho a mano, hecho con sentido</h1>
        <p className="max-w-xl text-cafe/80">
          Descubre a los artesanos de las ferias de Chile: sus productos, su historia y dónde encontrarlos esta semana.
        </p>
        <form action="/explorar" className="flex w-full max-w-md gap-2">
          <input name="q" placeholder="Busca carteras, quesos, cerámica…"
            className="flex-1 rounded-full border border-beige bg-white/70 px-4 py-2" />
          <button className="rounded-full bg-terracota px-5 py-2 text-crema hover:bg-cafe">Buscar</button>
        </form>
      </section>

      <section className="py-6">
        <h2 className="mb-3 font-display text-2xl">Categorías</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link key={c.value} href={`/explorar?categoria=${c.value}`}
              className="rounded-full border border-cafe/30 px-4 py-1.5 text-sm hover:bg-ambar/30">
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {!!featured?.length && (
        <section className="py-6">
          <h2 className="mb-3 font-display text-2xl">Artesanos con sello</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((a) => (
              <Link key={a.id} href={`/artesano/${a.slug}`}
                className="overflow-hidden rounded-2xl border border-beige bg-white/70 transition hover:shadow-md">
                {a.profile_photo_url
                  ? <Image src={a.profile_photo_url} alt={a.shop_name} width={300} height={200}
                      className="h-36 w-full object-cover" />
                  : <div className="h-36 w-full bg-beige" />}
                <div className="p-3">
                  <p className="font-medium">{a.shop_name}</p>
                  <SelloBadge status={a.verification_status} />
                  {a.rating_count > 0 && (
                    <p className="mt-1 text-xs text-cafe/70">★ {Number(a.rating_avg).toFixed(1)} ({a.rating_count})</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="my-10 rounded-3xl bg-verde px-6 py-10 text-center text-crema">
        <h2 className="font-display text-2xl">¿Eres artesano?</h2>
        <p className="mx-auto mt-2 max-w-lg text-crema/90">
          Crea tu perfil gratis, muestra tu catálogo y cuéntale a todos dónde encontrarte. Si todo lo tuyo es hecho a
          mano, postula al sello Sólo A Mano.
        </p>
        <Link href="/cuenta" className="mt-4 inline-block rounded-full bg-ambar px-6 py-2 font-medium text-verde">
          Súmate gratis
        </Link>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Verificar y commit**

Run: `npm test` → PASS. `npm run dev` → inicio muestra hero, buscador (envía a /explorar, 404 por ahora — OK), categorías y CTA verde.

```bash
git add -A && git commit -m "feat: pagina de inicio"
```

---

### Task 10: Explorar — grilla masonry con filtros y scroll infinito

**Files:**
- Create: `app/explorar/page.tsx`, `app/explorar/ExploreGrid.tsx`, `actions/explore.ts`, `components/MasonryGrid.tsx`

**Interfaces:**
- Consumes: `ProductCard`, `CATEGORIES`.
- Produces: `fetchProducts(opts: { page: number; category?: string; comuna?: string; verifiedOnly?: boolean; q?: string }): Promise<ExploreItem[]>` con `ExploreItem = { id, name, price_clp, photo_urls, artisans: { slug, shop_name, comuna, verification_status } }`; página con querystring `?q=&categoria=&comuna=&verificados=1`.

- [ ] **Step 1: Server action de búsqueda**

`actions/explore.ts`:

```ts
"use server";
import { createServerSupabase } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import type { Product, VerificationStatus } from "@/lib/types";

// Nota: los archivos "use server" solo pueden exportar funciones async;
// por eso PAGE_SIZE vive en lib/constants.ts (los type exports se borran al compilar y no molestan).

export type ExploreItem = Pick<Product, "id" | "name" | "price_clp" | "photo_urls"> & {
  artisans: { slug: string; shop_name: string; comuna: string; verification_status: VerificationStatus };
};

export async function fetchProducts(opts: {
  page: number; category?: string; comuna?: string; verifiedOnly?: boolean; q?: string;
}): Promise<ExploreItem[]> {
  const supabase = await createServerSupabase();
  let query = supabase
    .from("products")
    .select("id,name,price_clp,photo_urls,artisans!inner(slug,shop_name,comuna,verification_status)")
    .eq("available", true)
    .order("created_at", { ascending: false })
    .range(opts.page * PAGE_SIZE, opts.page * PAGE_SIZE + PAGE_SIZE - 1);

  if (opts.category) query = query.eq("category", opts.category);
  if (opts.comuna) query = query.ilike("artisans.comuna", `%${opts.comuna}%`);
  if (opts.verifiedOnly) query = query.eq("artisans.verification_status", "verificado");
  if (opts.q) query = query.or(`name.ilike.%${opts.q}%,description.ilike.%${opts.q}%`);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as unknown as ExploreItem[];
}
```

- [ ] **Step 2: MasonryGrid y grilla con scroll infinito**

`components/MasonryGrid.tsx`:

```tsx
export default function MasonryGrid({ children }: { children: React.ReactNode }) {
  return <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">{children}</div>;
}
```

`app/explorar/ExploreGrid.tsx`:

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { fetchProducts, type ExploreItem } from "@/actions/explore";
import { PAGE_SIZE } from "@/lib/constants";
import MasonryGrid from "@/components/MasonryGrid";
import ProductCard from "@/components/ProductCard";

type Filters = { category?: string; comuna?: string; verifiedOnly?: boolean; q?: string };

export default function ExploreGrid({ initial, filters }: { initial: ExploreItem[]; filters: Filters }) {
  const [items, setItems] = useState(initial);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(initial.length < PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(initial);
    setPage(0);
    setDone(initial.length < PAGE_SIZE);
  }, [initial]);

  useEffect(() => {
    if (done || !sentinel.current) return;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || loading) return;
      setLoading(true);
      const next = await fetchProducts({ ...filters, page: page + 1 });
      setItems((prev) => [...prev, ...next]);
      setPage((p) => p + 1);
      if (next.length < PAGE_SIZE) setDone(true);
      setLoading(false);
    });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [page, done, loading, filters]);

  if (!items.length) return <p className="py-16 text-center text-cafe/60">No encontramos productos con esos filtros.</p>;

  return (
    <>
      <MasonryGrid>
        {items.map((p) => <ProductCard key={p.id} product={p} artisan={p.artisans} />)}
      </MasonryGrid>
      <div ref={sentinel} className="h-8" />
      {loading && <p className="pb-8 text-center text-sm text-cafe/60">Cargando más…</p>}
    </>
  );
}
```

- [ ] **Step 3: Página con filtros por querystring**

`app/explorar/page.tsx`:

```tsx
import { fetchProducts } from "@/actions/explore";
import { CATEGORIES } from "@/lib/constants";
import ExploreGrid from "./ExploreGrid";

export const metadata = { title: "Explorar" };

type Params = { q?: string; categoria?: string; comuna?: string; verificados?: string };

export default async function ExplorarPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const filters = {
    q: params.q || undefined,
    category: params.categoria || undefined,
    comuna: params.comuna || undefined,
    verifiedOnly: params.verificados === "1",
  };
  const initial = await fetchProducts({ ...filters, page: 0 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 font-display text-3xl">Explorar</h1>
      <form className="mb-6 flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={params.q} placeholder="Buscar…"
          className="rounded-full border border-beige bg-white/70 px-4 py-1.5 text-sm" />
        <select name="categoria" defaultValue={params.categoria ?? ""}
          className="rounded-full border border-beige bg-white/70 px-3 py-1.5 text-sm">
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input name="comuna" defaultValue={params.comuna} placeholder="Comuna"
          className="rounded-full border border-beige bg-white/70 px-4 py-1.5 text-sm" />
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" name="verificados" value="1" defaultChecked={params.verificados === "1"} />
          Solo con sello
        </label>
        <button className="rounded-full bg-terracota px-4 py-1.5 text-sm text-crema">Filtrar</button>
      </form>
      <ExploreGrid key={JSON.stringify(filters)} initial={initial} filters={filters} />
    </div>
  );
}
```

- [ ] **Step 4: Verificar y commit**

Run: `npm run dev` → /explorar muestra los productos creados en Task 7 en masonry; filtrar por categoría y texto funciona; con >24 productos el scroll carga más (verificar con seed manual si se quiere). La búsqueda desde el inicio llega con `?q=`.

```bash
git add -A && git commit -m "feat: explorar tipo pinterest con filtros y scroll infinito"
```

---

### Task 11: Perfil público del artesano + página de producto

**Files:**
- Create: `app/artesano/[slug]/page.tsx`, `app/producto/[id]/page.tsx`, `components/ContactButtons.tsx`, `components/StarRating.tsx`
- Test: `tests/components/StarRating.test.tsx`

**Interfaces:**
- Consumes: `buildWhatsAppLink`, `ScheduleWeek`, `SelloBadge`, `ProductCard`, `MasonryGrid`, `formatCLP`, `categoryLabel`.
- Produces: `<ContactButtons artisan message />` (WhatsApp pre-armado, Instagram, Facebook, mail — solo los que existan); `<StarRating value onChange? />` (readonly si no hay onChange; interactivo para Task 12). Página de perfil incluye un `<section id="resenas">` placeholder que Task 12 reemplaza.

- [ ] **Step 1: Test de StarRating (falla primero)**

`tests/components/StarRating.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import StarRating from "@/components/StarRating";

describe("StarRating", () => {
  it("readonly muestra 5 estrellas con las llenas según value", () => {
    render(<StarRating value={3} />);
    const stars = screen.getAllByTestId(/star-/);
    expect(stars).toHaveLength(5);
    expect(stars.filter((s) => s.dataset.filled === "true")).toHaveLength(3);
  });
  it("interactivo llama onChange con la estrella clickeada", () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("star-4"));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
```

Run: `npm test` → Expected: FAIL.

- [ ] **Step 2: Implementar StarRating**

`components/StarRating.tsx`:

```tsx
"use client";

export default function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = (
          <svg key={n} viewBox="0 0 24 24" data-testid={`star-${n}`} data-filled={filled}
            className={`h-5 w-5 ${filled ? "fill-ambar" : "fill-beige"}`} aria-hidden>
            <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.2 5.8 20.9l1.6-7L2 9.2l7.1-.6L12 2z" />
          </svg>
        );
        if (!onChange) return star;
        return (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} estrellas`}>
            {star}
          </button>
        );
      })}
    </span>
  );
}
```

Run: `npm test` → Expected: PASS.

- [ ] **Step 3: ContactButtons**

`components/ContactButtons.tsx`:

```tsx
import { buildWhatsAppLink } from "@/lib/utils";
import type { Artisan } from "@/lib/types";

type ContactArtisan = Pick<Artisan, "whatsapp_phone" | "instagram_url" | "facebook_url" | "contact_email">;
const btn = "rounded-full px-4 py-1.5 text-sm font-medium";

export default function ContactButtons({ artisan, message }: { artisan: ContactArtisan; message: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {artisan.whatsapp_phone && (
        <a href={buildWhatsAppLink(artisan.whatsapp_phone, message)} target="_blank" rel="noopener noreferrer"
          className={`${btn} bg-verde text-crema hover:opacity-90`}>WhatsApp</a>
      )}
      {artisan.instagram_url && (
        <a href={artisan.instagram_url} target="_blank" rel="noopener noreferrer"
          className={`${btn} bg-terracota text-crema hover:bg-cafe`}>Instagram</a>
      )}
      {artisan.facebook_url && (
        <a href={artisan.facebook_url} target="_blank" rel="noopener noreferrer"
          className={`${btn} bg-terracota text-crema hover:bg-cafe`}>Facebook</a>
      )}
      {artisan.contact_email && (
        <a href={`mailto:${artisan.contact_email}`} className={`${btn} border border-cafe hover:bg-beige`}>Correo</a>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Perfil público**

`app/artesano/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { categoryLabel } from "@/lib/constants";
import SelloBadge from "@/components/SelloBadge";
import ContactButtons from "@/components/ContactButtons";
import ScheduleWeek from "@/components/ScheduleWeek";
import StarRating from "@/components/StarRating";
import MasonryGrid from "@/components/MasonryGrid";
import ProductCard from "@/components/ProductCard";
import type { Artisan, MarketSchedule, Product } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("artisans").select("shop_name, story").eq("slug", slug).maybeSingle();
  return data ? { title: data.shop_name, description: data.story.slice(0, 160) } : {};
}

export default async function ArtesanoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data: artisan } = await supabase.from("artisans").select("*").eq("slug", slug).maybeSingle<Artisan>();
  if (!artisan) notFound();

  const [{ data: products }, { data: schedules }] = await Promise.all([
    supabase.from("products").select("*").eq("artisan_id", artisan.id).eq("available", true)
      .order("created_at", { ascending: false }).returns<Product[]>(),
    supabase.from("market_schedules").select("*").eq("artisan_id", artisan.id).returns<MarketSchedule[]>(),
  ]);

  return (
    <div>
      <div className="h-44 w-full bg-beige sm:h-60">
        {artisan.cover_photo_url && (
          <Image src={artisan.cover_photo_url} alt="" width={1200} height={300} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="mx-auto max-w-5xl px-4">
        <div className="-mt-12 flex flex-wrap items-end gap-4">
          {artisan.profile_photo_url
            ? <Image src={artisan.profile_photo_url} alt={artisan.shop_name} width={112} height={112}
                className="h-28 w-28 rounded-full border-4 border-crema object-cover" />
            : <div className="h-28 w-28 rounded-full border-4 border-crema bg-ambar" />}
          <div className="pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl">{artisan.shop_name}</h1>
              <SelloBadge status={artisan.verification_status} size="lg" />
            </div>
            <p className="text-sm text-cafe/70">
              {categoryLabel(artisan.main_category)}{artisan.comuna && ` · ${artisan.comuna}`}
            </p>
            {artisan.rating_count > 0 && (
              <div className="mt-1 flex items-center gap-2 text-sm">
                <StarRating value={Number(artisan.rating_avg)} />
                <span>{Number(artisan.rating_avg).toFixed(1)} · {artisan.rating_count} reseñas</span>
              </div>
            )}
          </div>
        </div>

        {artisan.story && <p className="mt-5 max-w-2xl whitespace-pre-line">{artisan.story}</p>}

        <div className="mt-5">
          <ContactButtons artisan={artisan} message={`Hola, vi tu perfil "${artisan.shop_name}" en Sólo A Mano y quiero saber más.`} />
        </div>

        <section className="mt-8">
          <h2 className="mb-3 font-display text-2xl">¿Dónde encontrarme?</h2>
          <ScheduleWeek schedules={schedules ?? []} />
        </section>

        <section className="mt-8">
          <h2 className="mb-3 font-display text-2xl">Catálogo</h2>
          {products?.length
            ? <MasonryGrid>{products.map((p) => <ProductCard key={p.id} product={p} artisan={artisan} />)}</MasonryGrid>
            : <p className="text-cafe/60">Este artesano aún no sube productos.</p>}
        </section>

        <section id="resenas" className="mt-8 pb-8">
          <h2 className="mb-3 font-display text-2xl">Reseñas</h2>
          <p className="text-cafe/60">Las reseñas llegan pronto.</p>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Página de producto**

`app/producto/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { formatCLP } from "@/lib/utils";
import { categoryLabel } from "@/lib/constants";
import ContactButtons from "@/components/ContactButtons";
import SelloBadge from "@/components/SelloBadge";
import type { Artisan, Product } from "@/lib/types";

type ProductWithArtisan = Product & { artisans: Artisan };

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: product } = await supabase
    .from("products").select("*, artisans(*)").eq("id", id).maybeSingle<ProductWithArtisan>();
  if (!product) notFound();
  const artisan = product.artisans;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        {product.photo_urls.length
          ? product.photo_urls.map((u) => (
              <Image key={u} src={u} alt={product.name} width={800} height={800} className="w-full rounded-2xl object-cover" />
            ))
          : <div className="flex aspect-square items-center justify-center rounded-2xl bg-beige text-cafe/40">Sin foto</div>}
      </div>
      <div>
        <p className="text-sm text-cafe/60">{categoryLabel(product.category)}</p>
        <h1 className="font-display text-3xl">{product.name}</h1>
        <p className="mt-1 text-xl text-terracota">{formatCLP(product.price_clp)}</p>
        {!product.available && <p className="mt-1 text-sm font-medium text-terracota">Agotado por ahora</p>}
        {product.description && <p className="mt-4 whitespace-pre-line">{product.description}</p>}

        <div className="mt-6 rounded-2xl border border-beige bg-white/60 p-4">
          <Link href={`/artesano/${artisan.slug}`} className="flex items-center gap-3 hover:text-terracota">
            {artisan.profile_photo_url
              ? <Image src={artisan.profile_photo_url} alt={artisan.shop_name} width={48} height={48}
                  className="h-12 w-12 rounded-full object-cover" />
              : <div className="h-12 w-12 rounded-full bg-ambar" />}
            <div>
              <p className="font-medium">{artisan.shop_name}</p>
              <SelloBadge status={artisan.verification_status} />
            </div>
          </Link>
          <div className="mt-3">
            <ContactButtons artisan={artisan}
              message={`Hola, vi "${product.name}" en Sólo A Mano y me interesa. ¿Sigue disponible?`} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verificar y commit**

Run: `npm test` → PASS. `npm run dev` → perfil público muestra portada, sello (cuando corresponda), historia, botones de contacto (WhatsApp abre wa.me con el mensaje), semana de ferias y catálogo; producto muestra fotos grandes y botón de WhatsApp con el nombre del producto en el mensaje.

```bash
git add -A && git commit -m "feat: perfil publico del artesano y pagina de producto"
```

---

### Task 12: Reseñas con estrellas

**Files:**
- Create: `actions/reviews.ts`, `components/ReviewSection.tsx`, `components/ReviewForm.tsx`
- Modify: `app/artesano/[slug]/page.tsx` (reemplazar el placeholder `#resenas`)

**Interfaces:**
- Consumes: `StarRating`, tipos `Review`.
- Produces: `submitReview(formData): Promise<{ error?: string }>` (upsert por unique artisan+author), `deleteReview(artisanId: string)`; `<ReviewSection artisanId slug />` (server component: lista reseñas visibles + formulario según sesión).

- [ ] **Step 1: Server actions**

`actions/reviews.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function submitReview(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Inicia sesión para dejar tu reseña." };

  const artisanId = String(formData.get("artisan_id"));
  const slug = String(formData.get("slug"));
  const stars = parseInt(String(formData.get("stars")), 10);
  const comment = String(formData.get("comment") ?? "").trim();
  if (!(stars >= 1 && stars <= 5)) return { error: "Elige de 1 a 5 estrellas." };

  const { data: own } = await supabase.from("artisans").select("id").eq("owner_id", user.id).eq("id", artisanId).maybeSingle();
  if (own) return { error: "No puedes reseñar tu propio emprendimiento." };

  const { error } = await supabase.from("reviews").upsert(
    { artisan_id: artisanId, author_id: user.id, stars, comment },
    { onConflict: "artisan_id,author_id" }
  );
  if (error) return { error: "No pudimos guardar tu reseña: " + error.message };
  revalidatePath(`/artesano/${slug}`);
  return {};
}

export async function deleteReview(artisanId: string, slug: string): Promise<void> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("reviews").delete().eq("artisan_id", artisanId).eq("author_id", user.id);
  revalidatePath(`/artesano/${slug}`);
}
```

- [ ] **Step 2: Componentes**

`components/ReviewForm.tsx`:

```tsx
"use client";
import { useState, useTransition } from "react";
import { submitReview } from "@/actions/reviews";
import StarRating from "@/components/StarRating";
import type { Review } from "@/lib/types";

export default function ReviewForm({ artisanId, slug, existing }: { artisanId: string; slug: string; existing: Review | null }) {
  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(formData: FormData) {
    start(async () => {
      setSaved(false);
      const res = await submitReview(formData);
      if (res.error) setError(res.error);
      else { setError(null); setSaved(true); }
    });
  }

  return (
    <form action={onSubmit} className="rounded-2xl border border-beige bg-white/60 p-4">
      <p className="mb-2 font-medium">{existing ? "Editar mi reseña" : "Deja tu reseña"}</p>
      <input type="hidden" name="artisan_id" value={artisanId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="stars" value={stars} />
      <StarRating value={stars} onChange={setStars} />
      <textarea name="comment" rows={3} defaultValue={existing?.comment}
        placeholder="¿Cómo fue tu experiencia con este artesano?"
        className="mt-2 w-full rounded-lg border border-beige bg-crema px-3 py-2" />
      {error && <p className="text-sm text-terracota">{error}</p>}
      {saved && <p className="text-sm text-verde">¡Gracias por tu reseña!</p>}
      <button disabled={pending || stars === 0}
        className="mt-2 rounded-full bg-terracota px-5 py-1.5 text-sm text-crema disabled:opacity-50">
        {pending ? "Enviando…" : "Publicar"}
      </button>
    </form>
  );
}
```

`components/ReviewSection.tsx` (server component):

```tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import { deleteReview } from "@/actions/reviews";
import type { Review } from "@/lib/types";

export default async function ReviewSection({ artisanId, slug }: { artisanId: string; slug: string }) {
  const supabase = await createServerSupabase();
  const [{ data: { user } }, { data: reviews }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("reviews").select("*, profiles(display_name, avatar_url)")
      .eq("artisan_id", artisanId).eq("hidden", false)
      .order("created_at", { ascending: false }).returns<Review[]>(),
  ]);
  const mine = user ? reviews?.find((r) => r.author_id === user.id) ?? null : null;
  const { data: isOwner } = user
    ? await supabase.from("artisans").select("id").eq("id", artisanId).eq("owner_id", user.id).maybeSingle()
    : { data: null };

  return (
    <div className="flex flex-col gap-4">
      {!reviews?.length && <p className="text-cafe/60">Aún no hay reseñas. ¡Sé la primera persona en dejar una!</p>}
      {reviews?.map((r) => (
        <div key={r.id} className="rounded-2xl border border-beige bg-white/60 p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{r.profiles?.display_name ?? "Alguien"}</p>
            <StarRating value={r.stars} />
          </div>
          {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
          {user?.id === r.author_id && (
            <form action={deleteReview.bind(null, artisanId, slug)}>
              <button className="mt-1 text-xs text-terracota underline">Eliminar mi reseña</button>
            </form>
          )}
        </div>
      ))}
      {user && !isOwner && <ReviewForm artisanId={artisanId} slug={slug} existing={mine} />}
      {!user && (
        <p className="text-sm text-cafe/70">
          <Link href="/cuenta" className="underline">Inicia sesión</Link> para dejar tu reseña.
        </p>
      )}
    </div>
  );
}
```

En `app/artesano/[slug]/page.tsx`, reemplazar el contenido del `<section id="resenas">`:

```tsx
<section id="resenas" className="mt-8 pb-8">
  <h2 className="mb-3 font-display text-2xl">Reseñas</h2>
  <ReviewSection artisanId={artisan.id} slug={artisan.slug} />
</section>
```

(agregar `import ReviewSection from "@/components/ReviewSection";`)

- [ ] **Step 3: Verificar y commit**

Run: `npm run dev` → con una segunda cuenta (no dueña), dejar reseña de 4 estrellas → aparece en el perfil y `artisans.rating_avg` se actualiza (Table Editor); editarla la reemplaza (no duplica); el dueño no ve el formulario en su propio perfil; anónimo ve el link a iniciar sesión.

```bash
git add -A && git commit -m "feat: resenas con estrellas y promedio automatico"
```

---

### Task 13: Verificación — página informativa y formulario de solicitud

**Files:**
- Create: `app/verificacion/page.tsx`, `app/panel/verificacion/page.tsx`, `app/panel/verificacion/VerificationForm.tsx`, `actions/verification.ts`, `lib/upload-verification.ts`

**Interfaces:**
- Consumes: `createServerSupabase`, tipos `VerificationRequest`.
- Produces: `submitVerificationRequest(formData): Promise<{ error?: string }>` (crea la solicitud; el trigger de DB pone al artesano en `pendiente`; envía correo en Task 15); `uploadVerificationFile(file: File, kind: string): Promise<string>` (sube al bucket privado `verification`, retorna el path, no URL).

- [ ] **Step 1: Página pública del sello**

`app/verificacion/page.tsx`:

```tsx
import Link from "next/link";
import SelloBadge from "@/components/SelloBadge";

export const metadata = { title: "El sello Sólo A Mano" };

export default function VerificacionPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <SelloBadge status="verificado" size="lg" />
        <h1 className="mt-4 font-display text-4xl">El sello Sólo A Mano</h1>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <p>
          El sello certifica que un emprendimiento vende <strong>únicamente productos hechos a mano</strong>. Nada de
          reventa ni producción industrial: manos, oficio y cariño.
        </p>
        <h2 className="font-display text-2xl">¿Cómo se obtiene?</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Crea tu perfil de artesano y sube tu catálogo.</li>
          <li>Envía tu solicitud desde tu panel con: una foto tuya en tu puesto, una foto tuya haciendo tu producto, y
            si quieres, un video corto del proceso.</li>
          <li>Revisamos personalmente cada solicitud. Si todo calza, tu perfil luce el sello.</li>
        </ol>
        <p className="text-sm text-cafe/70">
          Si una solicitud se rechaza, te contamos el motivo y puedes volver a postular cuando quieras.
        </p>
        <Link href="/panel/verificacion" className="mx-auto mt-2 w-fit rounded-full bg-terracota px-6 py-2 text-crema">
          Postular al sello
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Subida al bucket privado**

`lib/upload-verification.ts`:

```ts
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export async function uploadVerificationFile(file: File, kind: "puesto" | "haciendo" | "video"): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión");

  let toUpload: File | Blob = file;
  let ext = "jpg";
  if (kind === "video") {
    if (file.size > MAX_VIDEO_BYTES) throw new Error("El video supera los 50 MB. Puedes pegar un link de YouTube.");
    ext = file.name.split(".").pop() ?? "mp4";
  } else {
    toUpload = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 2000, useWebWorker: true, fileType: "image/jpeg" });
  }
  const path = `${user.id}/${kind}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("verification").upload(path, toUpload);
  if (error) throw new Error("No pudimos subir el archivo: " + error.message);
  return path;
}
```

- [ ] **Step 3: Server action**

`actions/verification.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function submitVerificationRequest(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };
  const { data: artisan } = await supabase
    .from("artisans").select("id, shop_name, verification_status").eq("owner_id", user.id).maybeSingle();
  if (!artisan) return { error: "Primero crea tu perfil de artesano." };
  if (artisan.verification_status === "pendiente") return { error: "Ya tienes una solicitud en revisión." };
  if (artisan.verification_status === "verificado") return { error: "¡Tu emprendimiento ya tiene el sello!" };

  const stallPhoto = String(formData.get("stall_photo_path") ?? "");
  const makingPhoto = String(formData.get("making_photo_path") ?? "");
  if (!stallPhoto || !makingPhoto) return { error: "Las dos fotos son obligatorias." };

  const { error } = await supabase.from("verification_requests").insert({
    artisan_id: artisan.id,
    stall_photo_path: stallPhoto,
    making_photo_path: makingPhoto,
    video_path: String(formData.get("video_path") ?? "") || null,
    video_url: String(formData.get("video_url") ?? "").trim() || null,
    message: String(formData.get("message") ?? "").trim(),
  });
  if (error) return { error: "No pudimos enviar tu solicitud: " + error.message };

  revalidatePath("/panel/verificacion");
  return {};
}
```

- [ ] **Step 4: Formulario en el panel**

`app/panel/verificacion/page.tsx`:

```tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import VerificationForm from "./VerificationForm";
import SelloBadge from "@/components/SelloBadge";
import type { VerificationRequest } from "@/lib/types";

export const metadata = { title: "Verificación" };

export default async function PanelVerificacionPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: artisan } = await supabase
    .from("artisans").select("id, verification_status").eq("owner_id", user!.id).maybeSingle();
  if (!artisan) return <p>Primero <Link className="underline" href="/panel/perfil">crea tu perfil</Link>.</p>;

  const { data: lastRequest } = await supabase
    .from("verification_requests").select("*").eq("artisan_id", artisan.id)
    .order("created_at", { ascending: false }).limit(1).maybeSingle<VerificationRequest>();

  if (artisan.verification_status === "verificado") {
    return (
      <div className="text-center">
        <SelloBadge status="verificado" size="lg" />
        <p className="mt-3">¡Tu emprendimiento ya tiene el sello Sólo A Mano! 🎉</p>
      </div>
    );
  }
  if (artisan.verification_status === "pendiente") {
    return <p>Tu solicitud está <strong>en revisión</strong>. Te avisaremos cuando esté lista.</p>;
  }
  return (
    <div className="flex max-w-xl flex-col gap-4">
      {artisan.verification_status === "rechazado" && lastRequest && (
        <div className="rounded-xl border border-terracota/40 bg-terracota/10 p-4 text-sm">
          <p className="font-medium">Tu solicitud anterior fue rechazada.</p>
          {lastRequest.admin_comment && <p className="mt-1">Motivo: {lastRequest.admin_comment}</p>}
          <p className="mt-1">Puedes corregir y volver a postular aquí mismo.</p>
        </div>
      )}
      <VerificationForm />
    </div>
  );
}
```

`app/panel/verificacion/VerificationForm.tsx`:

```tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitVerificationRequest } from "@/actions/verification";
import { uploadVerificationFile } from "@/lib/upload-verification";

function FileField({ label, kind, name, required, accept, onPath }: {
  label: string; kind: "puesto" | "haciendo" | "video"; name: string;
  required?: boolean; accept: string; onPath: (name: string, path: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError(null);
    try {
      onPath(name, await uploadVerificationFile(file, kind));
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}{required && " *"}</label>
      <input type="file" accept={accept} onChange={onChange} disabled={busy}
        className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-beige file:px-3 file:py-1.5" />
      {busy && <p className="text-xs text-cafe/60">Subiendo…</p>}
      {done && <p className="text-xs text-verde">Listo ✓</p>}
      {error && <p className="text-xs text-terracota">{error}</p>}
    </div>
  );
}

export default function VerificationForm() {
  const router = useRouter();
  const [paths, setPaths] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const setPath = (name: string, path: string) => setPaths((p) => ({ ...p, [name]: path }));

  function onSubmit(formData: FormData) {
    Object.entries(paths).forEach(([k, v]) => formData.set(k, v));
    start(async () => {
      const res = await submitVerificationRequest(formData);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <h1 className="font-display text-2xl">Postular al sello Sólo A Mano</h1>
      <p className="text-sm text-cafe/70">
        Necesitamos ver que lo tuyo es 100% hecho a mano. Sube una foto tuya en tu puesto y una foto tuya haciendo tu
        producto. Un video corto del proceso suma puntos (opcional).
      </p>
      <FileField label="Foto en tu puesto" kind="puesto" name="stall_photo_path" required accept="image/*" onPath={setPath} />
      <FileField label="Foto haciendo tu producto" kind="haciendo" name="making_photo_path" required accept="image/*" onPath={setPath} />
      <FileField label="Video del proceso (opcional, máx. 50 MB)" kind="video" name="video_path" accept="video/*" onPath={setPath} />
      <label className="text-sm font-medium">…o link de YouTube (opcional)
        <input name="video_url" type="url" placeholder="https://youtube.com/…"
          className="w-full rounded-lg border border-beige bg-crema px-3 py-2" />
      </label>
      <label className="text-sm font-medium">Cuéntanos de tu proceso
        <textarea name="message" rows={3} className="w-full rounded-lg border border-beige bg-crema px-3 py-2"
          placeholder="Qué haces, con qué materiales, hace cuánto…" />
      </label>
      {error && <p className="text-sm text-terracota">{error}</p>}
      <button disabled={pending || !paths.stall_photo_path || !paths.making_photo_path}
        className="w-fit rounded-full bg-terracota px-6 py-2 text-crema disabled:opacity-50">
        {pending ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Verificar y commit**

Run: `npm run dev` → /verificacion explica el sello; desde el panel, subir 2 fotos y enviar → la página pasa a "en revisión"; `artisans.verification_status = 'pendiente'` (trigger); reenviar da error "ya tienes una solicitud en revisión".

```bash
git add -A && git commit -m "feat: solicitud de verificacion del sello"
```

---

### Task 14: Panel de admin — aprobar, rechazar y moderar

**Files:**
- Create: `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/RequestCard.tsx`, `actions/admin.ts`

**Interfaces:**
- Consumes: `createServiceSupabase`, tipos `VerificationRequest`, `Review`.
- Produces: `approveRequest(id: string)`, `rejectRequest(id: string, comment: string)`, `toggleReviewHidden(id: string, hidden: boolean)` — todas verifican rol admin server-side antes de usar el service client.

- [ ] **Step 1: Marcar tu cuenta como admin (manual del usuario)**

En Supabase → SQL Editor (reemplazar el correo):

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'parejavice@gmail.com');
```

- [ ] **Step 2: Guard y actions**

`actions/admin.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";

async function requireAdmin(): Promise<boolean> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin";
}

export async function approveRequest(id: string): Promise<void> {
  if (!(await requireAdmin())) return;
  const service = createServiceSupabase();
  await service.from("verification_requests")
    .update({ status: "aprobada", reviewed_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin");
}

export async function rejectRequest(id: string, comment: string): Promise<void> {
  if (!(await requireAdmin())) return;
  const service = createServiceSupabase();
  await service.from("verification_requests")
    .update({ status: "rechazada", admin_comment: comment, reviewed_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin");
}

export async function toggleReviewHidden(id: string, hidden: boolean): Promise<void> {
  if (!(await requireAdmin())) return;
  const service = createServiceSupabase();
  await service.from("reviews").update({ hidden }).eq("id", id);
  revalidatePath("/admin");
}

export async function signedVerificationUrl(path: string): Promise<string | null> {
  if (!(await requireAdmin())) return null;
  const service = createServiceSupabase();
  const { data } = await service.storage.from("verification").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
```

`app/admin/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/");
  return <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>;
}
```

- [ ] **Step 3: Página del admin**

`app/admin/page.tsx`:

```tsx
import { createServiceSupabase } from "@/lib/supabase/server";
import { signedVerificationUrl, toggleReviewHidden } from "@/actions/admin";
import RequestCard from "./RequestCard";
import type { Review, VerificationRequest } from "@/lib/types";

type RequestWithArtisan = VerificationRequest & { artisans: { shop_name: string; slug: string } };
type ReviewWithNames = Review & { profiles: { display_name: string }; artisans: { shop_name: string } };

export default async function AdminPage() {
  // El layout ya validó el rol; usamos service client para ver todo.
  const service = createServiceSupabase();
  const [{ data: requests }, { data: reviews }] = await Promise.all([
    service.from("verification_requests")
      .select("*, artisans(shop_name, slug)").eq("status", "pendiente")
      .order("created_at").returns<RequestWithArtisan[]>(),
    service.from("reviews")
      .select("*, profiles(display_name), artisans(shop_name)")
      .order("created_at", { ascending: false }).limit(50).returns<ReviewWithNames[]>(),
  ]);

  const requestsWithUrls = await Promise.all(
    (requests ?? []).map(async (r) => ({
      request: r,
      stallUrl: await signedVerificationUrl(r.stall_photo_path),
      makingUrl: await signedVerificationUrl(r.making_photo_path),
      videoUrl: r.video_path ? await signedVerificationUrl(r.video_path) : r.video_url,
    }))
  );

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-4 font-display text-3xl">Solicitudes de verificación</h1>
        {!requestsWithUrls.length && <p className="text-cafe/60">No hay solicitudes pendientes. 🎉</p>}
        <div className="flex flex-col gap-4">
          {requestsWithUrls.map(({ request, stallUrl, makingUrl, videoUrl }) => (
            <RequestCard key={request.id} request={request} stallUrl={stallUrl} makingUrl={makingUrl} videoUrl={videoUrl} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl">Últimas reseñas</h2>
        <div className="flex flex-col gap-2">
          {reviews?.map((r) => (
            <ReviewRow key={r.id} review={r} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ReviewRow({ review }: { review: ReviewWithNames }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-beige bg-white/60 px-3 py-2 text-sm">
      <p className={review.hidden ? "line-through opacity-50" : ""}>
        <strong>{review.profiles.display_name}</strong> → {review.artisans.shop_name}: ★{review.stars} “{review.comment}”
      </p>
      <form action={toggleReviewHidden.bind(null, review.id, !review.hidden)}>
        <button className="text-terracota underline">{review.hidden ? "Mostrar" : "Ocultar"}</button>
      </form>
    </div>
  );
}
```

`app/admin/RequestCard.tsx`:

```tsx
"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { approveRequest, rejectRequest } from "@/actions/admin";
import type { VerificationRequest } from "@/lib/types";

type Props = {
  request: VerificationRequest & { artisans: { shop_name: string; slug: string } };
  stallUrl: string | null;
  makingUrl: string | null;
  videoUrl: string | null;
};

export default function RequestCard({ request, stallUrl, makingUrl, videoUrl }: Props) {
  const [comment, setComment] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className="rounded-2xl border border-beige bg-white/60 p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium">
          {request.artisans.shop_name}{" "}
          <Link href={`/artesano/${request.artisans.slug}`} className="text-sm underline" target="_blank">ver perfil</Link>
        </p>
        <p className="text-xs text-cafe/60">{new Date(request.created_at).toLocaleDateString("es-CL")}</p>
      </div>
      {request.message && <p className="mt-2 text-sm">“{request.message}”</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        {stallUrl && <a href={stallUrl} target="_blank" rel="noopener noreferrer">
          <img src={stallUrl} alt="Foto del puesto" className="h-40 rounded-lg object-cover" /></a>}
        {makingUrl && <a href={makingUrl} target="_blank" rel="noopener noreferrer">
          <img src={makingUrl} alt="Haciendo el producto" className="h-40 rounded-lg object-cover" /></a>}
      </div>
      {videoUrl && <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline">Ver video</a>}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button disabled={pending} onClick={() => start(() => approveRequest(request.id))}
          className="rounded-full bg-verde px-5 py-1.5 text-sm text-crema disabled:opacity-50">Aprobar sello</button>
        <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Motivo del rechazo"
          className="rounded-lg border border-beige bg-crema px-3 py-1.5 text-sm" />
        <button disabled={pending || !comment.trim()} onClick={() => start(() => rejectRequest(request.id, comment.trim()))}
          className="rounded-full border border-terracota px-5 py-1.5 text-sm text-terracota disabled:opacity-50">Rechazar</button>
      </div>
    </div>
  );
}
```

Nota: las imágenes de verificación usan `<img>` (no `next/image`) porque las signed URLs expiran y no son parte del dominio de imágenes públicas configurado.

- [ ] **Step 4: Verificar y commit**

Run: `npm run dev` → con tu cuenta admin, /admin muestra la solicitud de Task 13 con las fotos visibles (signed URLs); Aprobar → el perfil del artesano muestra el sello y su panel dice verificado; con otra solicitud, Rechazar con motivo → el artesano ve el motivo y puede re-postular; ocultar una reseña la saca del perfil público y del promedio; una cuenta no-admin en /admin es redirigida al inicio.

```bash
git add -A && git commit -m "feat: panel de admin para verificaciones y moderacion"
```

---

### Task 15: Correo de aviso, SEO y deploy a Vercel

**Files:**
- Create: `lib/email.ts`, `app/sitemap.ts`, `app/robots.ts`, `README.md`
- Modify: `actions/verification.ts`

**Interfaces:**
- Consumes: `submitVerificationRequest` de Task 13.
- Produces: `notifyAdminNewRequest(shopName: string, message: string): Promise<void>`; sitio en producción.

- [ ] **Step 1: Resend (manual del usuario + código)**

Crear cuenta en https://resend.com → API Key → pegarla en `.env.local` como `RESEND_API_KEY`.

```bash
npm i resend
```

`lib/email.ts`:

```ts
import { Resend } from "resend";

export async function notifyAdminNewRequest(shopName: string, message: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const admin = process.env.ADMIN_EMAIL;
  if (!key || !admin) return; // sin config, no bloquea la solicitud
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    await new Resend(key).emails.send({
      from: "Sólo A Mano <onboarding@resend.dev>",
      to: admin,
      subject: `Nueva solicitud de sello: ${shopName}`,
      html: `<p><strong>${shopName}</strong> postuló al sello Sólo A Mano.</p>
             ${message ? `<p>Mensaje: “${message}”</p>` : ""}
             <p><a href="${site}/admin">Revisar en el panel de admin</a></p>`,
    });
  } catch {
    // el correo es best-effort; la solicitud ya quedó guardada
  }
}
```

En `actions/verification.ts`, después del insert exitoso y antes de `revalidatePath`:

```ts
import { notifyAdminNewRequest } from "@/lib/email";
// ...dentro de submitVerificationRequest, tras verificar que no hubo error:
await notifyAdminNewRequest(artisan.shop_name, String(formData.get("message") ?? "").trim());
```

(La query de `artisan` en esa action ya selecciona `shop_name`.)

- [ ] **Step 2: SEO**

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createServerSupabase();
  const { data: artisans } = await supabase.from("artisans").select("slug");
  return [
    { url: site, priority: 1 },
    { url: `${site}/explorar`, priority: 0.9 },
    { url: `${site}/verificacion`, priority: 0.5 },
    ...(artisans ?? []).map((a) => ({ url: `${site}/artesano/${a.slug}`, priority: 0.8 })),
  ];
}
```

`app/robots.ts`:

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/panel", "/admin", "/cuenta"] },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: README**

`README.md` con: descripción de una línea, stack, cómo correr local (`npm i`, `.env.local` según `.env.example`, `npm run dev`), cómo aplicar `supabase/schema.sql`, cómo marcar el admin (SQL de Task 14 Step 1), y lista exacta de env vars para Vercel.

- [ ] **Step 4: Deploy (manual del usuario, guiado)**

1. `git push` a GitHub (crear repo si no existe: `gh repo create solo-a-mano --private --source=. --push`).
2. En https://vercel.com → Import Project → seleccionar el repo. Framework: Next.js (auto).
3. Pegar las env vars de `.env.example` con valores reales; `NEXT_PUBLIC_SITE_URL` = la URL de producción que asigne Vercel.
4. Deploy → agregar `https://TU-DOMINIO.vercel.app/cuenta/callback` en Supabase → Authentication → URL Configuration → Redirect URLs, y la URL base en Site URL.

- [ ] **Step 5: Verificación final y commit**

Run: `npm run build && npm test` → Expected: build y tests OK.
En producción: registrarse, crear perfil, subir producto, verlo en /explorar, enviar solicitud → llega el correo a parejavice@gmail.com → aprobar en /admin → sello visible.

```bash
git add -A && git commit -m "feat: correo de aviso, seo y configuracion de deploy"
git push
```

---

### Task 16: Pulido visual final

**Files:**
- Modify: los que indique la revisión visual (sin cambios de lógica ni de datos)

- [ ] **Step 1: Revisión visual con la skill de diseño**

Invocar la skill `frontend-design:frontend-design` y recorrer todas las páginas en el navegador (inicio, explorar, perfil, producto, panel, admin, cuenta, verificación) puliendo: jerarquía tipográfica (Fraunces en títulos), espaciados consistentes, estados hover/focus visibles, contraste suficiente del texto sobre crema/beige, responsive en móvil (la mayoría de los visitantes de feria entran por celular), y estados vacíos amables.

- [ ] **Step 2: Verificar y commit**

Run: `npm run build && npm test` → OK. Revisar en el navegador a 375px y 1280px de ancho.

```bash
git add -A && git commit -m "style: pulido visual final"
git push
```
