# Sólo A Mano

Plataforma de discovery para artesanos locales con sello de verificación.

## Stack

- **Next.js 15** - Framework React con App Router
- **Supabase** - Backend y base de datos PostgreSQL
- **Tailwind CSS v4** - Estilos y diseño responsivo
- **Vercel** - Hosting en producción

## Cómo correr en local

### 1. Instalar dependencias

```bash
npm i
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

Luego edita `.env.local` con tus credenciales de Supabase y otros servicios.

### 3. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Configurar la base de datos en Supabase

### 1. Crear proyecto en Supabase

Dirígete a [Supabase](https://supabase.com) y crea un nuevo proyecto.

### 2. Aplicar el esquema

En el dashboard de Supabase, ve a **SQL Editor** y ejecuta el contenido del archivo `supabase/schema.sql`:

```sql
-- Copia todo el contenido de supabase/schema.sql y pégalo aquí
```

### 3. Marcar cuenta como admin

Para marcar tu cuenta como administrador, ejecuta en el SQL Editor:

```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'parejavice@gmail.com');
```

Reemplaza `parejavice@gmail.com` con tu correo.

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

## Variables de entorno para Vercel

Cuando despliegues en Vercel, configura las siguientes variables de entorno:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de rol de servicio (lado servidor) | `eyJhbGc...` |
| `ADMIN_EMAIL` | Correo del administrador para notificaciones | `admin@example.com` |
| `RESEND_API_KEY` | API Key de Resend (opcional) | `re_xxxxx` |
| `NEXT_PUBLIC_SITE_URL` | URL de producción de tu sitio | `https://tu-dominio.vercel.app` |

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
- `/supabase` - Esquema de base de datos y migraciones

## Licencia

Privado - Proyecto de Ribs
