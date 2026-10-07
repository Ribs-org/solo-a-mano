# Sistema de diseño — Sólo A Mano

Dirección **orgánica y en zigzag**: colores vivos de marca joven (lima ácido, azul eléctrico,
rosado) sobre papel, con formas blandas en vez de cajas. Los productos flotan sueltos sobre
manchas de color, cuelgan etiquetas de cartón y un hilo recorre la portada uniendo las escenas.

Pilares de marca y cómo se traducen:

| Pilar | En la interfaz |
|---|---|
| Creatividad | Composición en zigzag, productos flotando, sketches a mano |
| Juventud | Grotesca con actitud, lima ácido y azul eléctrico |
| Natural | Fondo de papel con grano, fotos de proceso, tinta en vez de colores digitales |
| Revolución | Un marketplace de ferias con colores y composición de marca joven, no de catálogo |
| Irrepetible | Cada pieza con su lugar, tamaño y giro propios; sketches que nunca se dibujan igual |

## Color

Tokens en `app/globals.css` (`@theme`). Usa siempre el token, nunca el hex suelto.

| Token | Hex | Rol |
|---|---|---|
| `bone` | `#F4F2EC` | Fondo de página (papel) |
| `paper` | `#FBFAF6` | Tarjetas, campos de formulario, polaroids |
| `ink` | `#111111` | Texto, líneas finas, bloques oscuros |
| `fern` | `#111111` | Menú, footer y botones oscuros (alias de ink) |
| `lime` | `#D4FF3A` | Acción: botones principales, stickers, resaltado al pasar el mouse |
| `electric` | `#2433FF` | Azul firma: "a mano" del título y **una** sección fuerte por página |
| `lilac-soft` | `#E4DAF7` | Superficie secundaria |
| `lilac` | `#A98BE8` | Cinta washi y detalles |
| `bubblegum` | `#FF8FC7` | Detalle juvenil puntual. **Nunca para texto** |
| `copihue` | `#B8285C` | Solo errores y "agotado" |

**Proporción 60 / 30 / 10:** papel de fondo · superficies de color · acción en lima.

**Contraste (WCAG AA, mínimo 4,5:1 en texto):**

| Combinación | Ratio |
|---|---|
| `ink` sobre `bone` | 16,9:1 |
| `ink` sobre `lime` | 16,3:1 |
| blanco/`paper` sobre `electric` | 7,0:1 |
| `copihue` sobre `bone` | 5,3:1 |

No usar `lime`, `bubblegum` ni `lilac` como color de texto sobre fondos claros.

## Tipografía

Fuentes cargadas con `next/font` en `app/layout.tsx`.

| Clase | Fuente | Uso |
|---|---|---|
| `font-serif` | Instrument Serif (cursiva) | La primera palabra de cada título (*Cerámicas*, *Fashion*, *Solo cosas*) |
| `font-display` | Bricolage Grotesque | El resto del título, en **minúsculas** y peso medio (`font-medium tracking-tight`) |
| `font-mono` | JetBrains Mono | Precios y rótulos pequeños ("Temporada 2026") |
| `font-sans` | Inter | Texto corrido, botones y formularios |
| `font-script` | Pinyon Script | **Solo** leyendas de las polaroids |

Títulos: `text-5xl` → `sm:text-7xl`, `leading-[0.95]`. Nada de títulos en mayúsculas.

## Forma y componentes

- **Nada de cajas.** Las agrupaciones se marcan con **manchas orgánicas** (`.blob`, cambian de forma lento), no con rectángulos.
- **Esquinas redondeadas:** botones y buscador en píldora (`rounded-full`), tarjetas `rounded-2xl`, campos `rounded-lg`.
- **Botón principal:** píldora `bg-lime` con borde `ink`; al pasar el mouse invierte a `bg-ink text-lime`.
- **Producto flotante:** PNG recortado, sin marco, con `drop-shadow` que sigue la silueta y el baile (`animate-sway`).
  Su lugar, tamaño y giro se definen a mano en `lib/homeSections.ts` (`spot`).
- **Etiqueta colgante** (`.hang-tag`): cartón `paper` con esquinas recortadas y hoyito, atado con un hilo;
  nombre en Inter, precio en mono y sello "Ejemplo" en lima.
- **Polaroid:** marco `paper`, cinta washi (`lilac`/`lime`), leyenda en `font-script`, levemente girada.

## Composición de la portada

1. Portada breve pegada a la izquierda; a la derecha, mancha lima donde nace el hilo.
2. Tres escenas que se alternan: **izquierda, derecha, izquierda** (`side` en `lib/homeSections.ts`).
   Título y productos van pegados al mismo lado; el lado libre queda para respirar, el sketch del oficio y el hilo.
3. **Burbujas de talleres destacados** en el lado libre (contrario al contenido): 3 círculos escalonados que flotan
   (`animate-float`), con foto o inicial y el nombre al lado. Salen de Supabase (verificados de las categorías de la escena,
   mejor evaluados primero) y se completan con perfiles de ejemplo (`lib/featuredArtisans.ts`). En celular, en una fila bajo los productos.
4. Color de cada escena solo en su mancha: lila (Cerámicas), azul eléctrico (Fashion), rosado (Joyería).

## Movimiento

- **Entrada lateral:** cada escena entra deslizándose desde su lado (`.scene-enter`, `--from: -1 | 1`).
- **Parallax por capas:** mancha lenta (`--speed` positivo), productos rápidos y cada uno distinto (negativo).
- **Hilo** (`components/home/Thread.tsx`): se dibuja a medida que se recorre la página (`.thread-path`). Solo desde `md`.
- Baile de las piezas y sketches que se dibujan al aparecer.
- Todo se apaga con `prefers-reduced-motion`. Parallax y `animate-sway` usan ambos `animation`: nunca en el mismo elemento.

## Pendiente (segunda pasada)

- Las páginas fuera de la portada (explorar, producto, artesano, panel, cuenta, admin) heredan colores,
  fuentes y esquinas redondeadas, pero aún no la composición orgánica.
- "Desde el taller", categorías y artesanos con sello están fuera de la portada por ahora
  (los componentes siguen en `components/home/`).
