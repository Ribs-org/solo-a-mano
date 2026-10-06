# Sistema de diseño — Sólo A Mano

Dirección **"Revolución editorial"**: la interfaz habla como una marca de moda independiente
(tipografía protagonista, grilla de revista, esquinas rectas) y lo hecho a mano aparece en el
contenido (fotos de taller, sketches de p5.brush, polaroids, textura de papel).

Pilares de marca y cómo se traducen:

| Pilar | En la interfaz |
|---|---|
| Creatividad | Grilla asimétrica, stickers girados, sketches a mano |
| Juventud | Grotesca con actitud, lima ácido y azul eléctrico |
| Natural | Fondo de papel con grano, fotos de proceso, tinta en vez de colores digitales |
| Revolución | Un marketplace de ferias que se ve como una marca de vanguardia |
| Irrepetible | Cada pieza presentada como única ("N° 01", "Drop 01"); sketches que nunca se dibujan igual |

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
| `font-display` | Bricolage Grotesque (variable, ejes `opsz` y `wdth`) | Títulos: `font-extrabold uppercase`, tracking negativo, `[font-stretch:80–85%]` en los grandes |
| `font-serif` | Instrument Serif (cursiva) | Frases y la palabra destacada ("a mano", "taller"); bajadas de sección |
| `font-mono` | JetBrains Mono | Rótulos (`N° 01`, `Drop 01`), precios, botones y navegación por secciones |
| `font-sans` | Inter | Texto corrido y formularios |
| `font-script` | Pinyon Script | **Solo** leyendas de las polaroids |

Escala orientativa: título de portada `clamp(3rem, 9vw, 7.5rem)` · título de sección `text-4xl`→`sm:text-6xl` ·
texto 16px · rótulos mono 10–12px en mayúsculas con `tracking-[0.2em]`.

## Forma y componentes

- **Esquinas rectas** en botones, campos, bloques y tarjetas. Solo son redondos los avatares y el logo.
- **Líneas finas** (`border-ink/15`, o `border-ink` para separar zonas) en vez de sombras.
- **Botón principal:** `bg-lime`, texto en mayúsculas, borde `ink`; al pasar el mouse invierte a `bg-ink text-lime`.
- **Sticker:** `bg-lime border border-ink font-mono uppercase`, girado (`-rotate-6`). Para "Ejemplo", "Nuevo", "100% hecho a mano".
- **Ficha de producto:** foto sobre `paper` + tinte de la sección; debajo, nombre en mayúsculas a la izquierda y precio en mono a la derecha, separados por una línea fina.
- **Polaroid:** marco `paper`, cinta washi (`lilac`/`lime`), leyenda en `font-script`, levemente girada.

## Movimiento

- Baile de las piezas (`animate-sway`), sketches que se dibujan al aparecer, parallax con `.parallax` + `--speed`.
- Todo se apaga con `prefers-reduced-motion`.
- Parallax y `animate-sway` usan ambos `animation`: nunca en el mismo elemento (parallax en el contenedor).

## Pendiente (segunda pasada)

Las páginas fuera de la portada (explorar, producto, artesano, panel, cuenta, admin) ya heredan colores,
fuentes y esquinas, pero falta adaptarles el layout editorial (títulos grotescos en mayúsculas, rótulos mono).
