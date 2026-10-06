# Sólo A Mano

Plataforma de discovery para artesanos locales con sello de verificación.

## Stack

- **Next.js 16** - Framework React con App Router
- **Supabase** - Backend y base de datos PostgreSQL
- **Tailwind CSS v4** - Estilos y diseño responsivo
- **Vercel** - Hosting en producción

> Nota: `middleware.ts` todavía usa la convención `middleware.ts`, marcada como deprecated-pero-funcional en Next 16 (pendiente migrar a `proxy.ts`).

## Ambientes y flujo de trabajo

| Rama | Sitio | Supabase | Quién lo ve |
|------|-------|----------|-------------|
| `main` | producción (`tudominio.cl`) | proyecto **PROD** (datos reales) | clientes |
| `dev` | `dev.tudominio.cl` | proyecto **DEV** (datos de prueba) | el equipo (protegido con login de Vercel) |
| `feature/*` | preview de Vercel | proyecto **DEV** | el equipo |

```
feature/xxx ──PR──► dev ──PR──► main
```

1. `git checkout dev && git pull && git checkout -b feature/mi-cambio`
2. Si cambias la base de datos: `npx supabase migration new nombre_del_cambio` y escribe el SQL en el archivo creado en `supabase/migrations/`.
3. PR hacia **dev**. El CI (lint, tests y build) tiene que pasar.
4. Al mergear a `dev`, las migraciones se aplican solas a Supabase DEV y el cambio queda en `dev.tudominio.cl`.
5. Cuando todo esté probado: PR de **dev → main** (requiere aprobación). Al mergear se aplican las migraciones a PROD y se despliega.
6. Hotfix urgente: rama `hotfix/xxx` desde `main`, PR a `main` y después mergea `main` en `dev`.

Reglas:
- Nadie hace push directo a `dev` ni a `main`. A `main` solo se llega desde `dev` o `hotfix/*`.
- Nunca se edita la base de datos de producción desde el SQL Editor. Todo cambio va como migración.
- Las migraciones deben ser compatibles con la versión anterior de la app (primero agregar, en otro PR borrar).

## Cómo correr en local

### 1. Instalar dependencias

```bash
npm i
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Completa `.env.local` con las credenciales del proyecto Supabase **DEV** (Settings → API). En local nunca se usan las credenciales de producción.

### 3. Cargar datos de prueba (opcional)

```bash
npm run seed:dev
```

Crea un admin, 7 artesanos (verificados, pendiente, rechazado y sin verificar) con productos, fotos y horarios, 10 compradores y sus reseñas. Todas las cuentas usan la contraseña `demo1234`:

- `admin@example.com`
- `artesano1@example.com` … `artesano7@example.com`
- `comprador1@example.com` … `comprador10@example.com`

Es re-ejecutable: borra lo que creó la vez anterior. Solo corre si la URL de Supabase coincide con `SUPABASE_DEV_PROJECT_REF`, así que no puede tocar producción.

### 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Base de datos (Supabase)

El esquema vive en `supabase/migrations/` y se aplica con la [Supabase CLI](https://supabase.com/docs/guides/cli) (`npx supabase`). GitHub Actions lo aplica solo al mergear a `dev` o `main` (`.github/workflows/migraciones.yml`).

Para aplicarlo a mano a un proyecto:

```bash
npx supabase login
npx supabase link --project-ref <REF>
npx supabase db push
```

### Marcar cuenta como admin

```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'parejavice@gmail.com');
```

## Configurar admin en Resend (opcional)

Para habilitar notificaciones por correo de nuevas solicitudes de verificación:

1. Crea una cuenta en [Resend](https://resend.com)
2. Obtén tu API Key
3. Agrega a `.env.local`:
   ```
   RESEND_API_KEY=tu_api_key
   ADMIN_EMAIL=tu_email@example.com
   ```

Sin estas variables, las notificaciones no se enviarán pero la aplicación seguirá funcionando.

## Variables de entorno en Vercel

Se configuran por ambiente: **Production** apunta a Supabase PROD y **Preview** (rama `dev` y previews de PRs) a Supabase DEV.

| Variable | Production | Preview |
|----------|------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de PROD | URL de DEV |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key de PROD | anon key de DEV |
| `SUPABASE_SERVICE_ROLE_KEY` | service role de PROD | service role de DEV |
| `NEXT_PUBLIC_SITE_URL` | `https://tudominio.cl` | `https://dev.tudominio.cl` |
| `ADMIN_EMAIL` | correo del admin | correo de pruebas |
| `RESEND_API_KEY` | API key (opcional) | vacío u otra key |

Fuera de producción, `robots.txt` bloquea todo para que dev no aparezca en Google.

## Build y testing

```bash
# Build de producción
npm run build

# Ejecutar tests
npm test
```

## Estructura del proyecto

- `/app` - Rutas y páginas Next.js
- `/actions` - Server Actions para funcionalidades del servidor
- `/components` - Componentes React reutilizables
- `/lib` - Utilidades y configuraciones
- `/public` - Archivos estáticos
- `/supabase` - Migraciones de base de datos y config de la CLI
- `/scripts` - Seed de datos de prueba para dev
- `/.github/workflows` - CI y migraciones automáticas

## Licencia

Privado - Proyecto de Ribs
