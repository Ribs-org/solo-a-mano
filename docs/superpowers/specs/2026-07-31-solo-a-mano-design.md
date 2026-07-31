# Sólo A Mano — Diseño de la plataforma

**Fecha:** 2026-07-31
**Estado:** Aprobado por el dueño del proyecto

## Qué es

Una vitrina web para artesanos chilenos que venden en ferias (Plaza Ñuñoa, ferias navideñas, ferias de fin de semana, etc.). Los artesanos crean un perfil con su catálogo de productos hechos a mano, sus ubicaciones frecuentes y sus datos de contacto. Los visitantes vitrinean, exploran tipo Pinterest, y contactan al artesano directamente (WhatsApp/Instagram/mail). No hay venta ni pagos dentro de la plataforma.

El diferenciador es el **sello "Sólo A Mano"**: una verificación manual de que el emprendimiento vende únicamente productos hechos a mano, aprobada por el administrador de la plataforma.

## Decisiones tomadas

| Decisión | Elección |
| --- | --- |
| Modelo de venta | Solo vitrina + contacto. Sin carrito, pagos ni stock. |
| Cuentas de visitantes | Vitrineo libre sin cuenta; cuenta requerida para dejar rating/comentario. |
| Contenido de /explorar | Solo productos del catálogo (grilla masonry). Sin "publicaciones" tipo red social. |
| Destino de los ratings | Al artesano (estilo Airbnb), no por producto. |
| Aprobación de verificación | Panel de admin en la web + aviso por correo al dueño. |
| Stack | Next.js 15 (App Router, TypeScript) + Tailwind CSS + Supabase + Vercel. |
| Correo transaccional | Resend (capa gratuita). |

## Arquitectura

- **Next.js 15 App Router** con renderizado en servidor para que Google indexe perfiles y productos (SEO es clave para una vitrina).
- **Supabase**: Postgres (datos), Auth (login con Google y email/contraseña), Storage (fotos y videos).
- **Vercel** para deploy; optimización de imágenes con `next/image`.
- **Row Level Security** en todas las tablas: cada artesano edita solo lo suyo, cada comprador edita solo sus reseñas, las solicitudes de verificación solo las ve el admin.

### Roles

- **Visitante** (sin cuenta): vitrinea, explora, busca, ve perfiles, usa botones de contacto.
- **Comprador** (cuenta): lo anterior + deja estrellas y comentarios.
- **Artesano** (cuenta): panel propio para perfil, productos, ubicaciones y solicitud de verificación. Una cuenta parte como comprador y se convierte en artesano al crear su perfil de emprendimiento.
- **Admin** (dueño de la plataforma): panel `/admin`. La cuenta se marca como admin directamente en la base de datos, una sola vez.

## Modelo de datos (Supabase / Postgres)

- **`profiles`** — toda cuenta: nombre, avatar, rol (`comprador` / `artesano` / `admin`). Se crea automáticamente al registrarse (trigger sobre `auth.users`).
- **`artisans`** — perfil de emprendimiento: nombre, slug único para URL (`/artesano/cuero-y-greda`), foto de perfil, foto de portada, historia/descripción, comuna, categoría principal, links (Instagram, Facebook), contacto (WhatsApp, mail), estado de verificación (`no_verificado` / `pendiente` / `verificado` / `rechazado`), promedio y conteo de reseñas (denormalizados).
- **`products`** — nombre, descripción, precio referencial opcional (CLP), categoría, hasta ~5 fotos, flag disponible/agotado.
  - Categorías: carteras y bolsos, zapatos y cuero, quesos y alimentos, cerámica, tejidos, joyería, madera, otros.
- **`market_schedules`** — ubicaciones frecuentes: día de la semana, nombre de la feria/lugar, comuna, horario aproximado, notas libres ("solo la feria navideña de diciembre").
- **`reviews`** — estrellas (1–5) + comentario, dirigidas a un artesano. Máximo una por comprador por artesano (editable). Al insertar/editar/borrar se recalcula el promedio en `artisans`.
- **`verification_requests`** — foto del puesto, foto del artesano haciendo su producto, video opcional (archivo ≤ ~50 MB o link de YouTube), mensaje del artesano, estado, comentario del admin al rechazar (para que el artesano corrija y re-postule).

## Páginas

### Públicas

- **`/`** — hero con logo y lema, buscador prominente, categorías destacadas, artesanos verificados destacados, sección "¿Eres artesano? Súmate".
- **`/explorar`** — grilla masonry tipo Pinterest con productos de todos los artesanos, scroll infinito. Filtros: categoría, comuna, solo verificados, búsqueda por texto.
- **`/artesano/[slug]`** — portada, foto, sello si está verificado, historia, botones de contacto (WhatsApp con mensaje pre-armado, Instagram, Facebook, mail), semana de ferias, catálogo, reseñas con promedio.
- **`/producto/[id]`** — fotos grandes, descripción, precio referencial, botón "Contactar por WhatsApp" (mensaje pre-armado mencionando el producto), link al perfil del artesano.
- **`/verificacion`** — explica el sello y cómo obtenerlo.

### Con cuenta

- **`/cuenta`** — login/registro (Google o email).
- **`/panel`** — panel del artesano: editar perfil, gestionar productos, gestionar ubicaciones, formulario de verificación con estado actual.
- **`/admin`** — solo admin: cola de solicitudes pendientes con fotos/video, aprobar/rechazar con motivo, lista de artesanos y comentarios con opción de ocultar.

### Notificaciones

Al llegar una solicitud de verificación nueva, se envía un correo al admin (gptchatpro@gmail.com) con resumen y link al panel, vía Resend.

## Diseño visual

- **Paleta:** terracota `#C05D3E` (acciones, sello), beige claro `#D9C7B8` / crema (fondos), café medio `#6E4F3A` (texto), ámbar `#E0A96D` (acentos, hovers), verde oscuro `#2E3B32` (footer, contrastes).
- **Tipografía:** serif cálida para títulos (en la línea del logo), sans legible para cuerpo.
- **Sello "Sólo A Mano":** insignia visual reconocible inspirada en el logo (mano con vasija), presente en tarjetas y perfiles verificados.
- **Estética:** cálida y artesanal; fotos grandes protagonistas, esquinas redondeadas, la interfaz acompaña.
- **Assets existentes:** `assets/logo.png` (logo), `assets/paleta.png` (referencia de paleta).

## Manejo de errores y casos borde

- Perfiles/productos sin foto muestran placeholder con la paleta.
- Artesano rechazado ve el motivo del rechazo y puede re-postular.
- Al eliminar un artesano se eliminan en cascada sus productos, ubicaciones, reseñas y solicitudes.
- Las imágenes se comprimen/redimensionan al subir para cuidar el límite gratuito de Supabase Storage.
- Reseñas: solo compradores con cuenta; el autor puede editar/borrar la suya; el admin puede ocultar cualquiera.

## Plan de construcción (orden)

1. Base del proyecto + Supabase + esquema de datos + auth.
2. Perfiles de artesano y catálogo de productos (panel del artesano).
3. Páginas públicas: inicio, explorar, perfil, producto, con búsqueda y filtros.
4. Ubicaciones frecuentes.
5. Reseñas con estrellas.
6. Verificación: formulario, panel admin, correo de aviso.
7. Pulido visual final y deploy a Vercel.

Cada etapa queda funcionando y probada antes de pasar a la siguiente.

## Fuera de alcance (por ahora)

- Pagos, carrito, stock y despachos.
- Publicaciones tipo red social de los artesanos.
- Reseñas por producto.
- App móvil.
