import type { Category } from "@/lib/constants";
import type { SketchName } from "@/lib/sketches";

/**
 * Dónde flota el PNG dentro de su escena (solo en pantallas medianas o más; en celular van en
 * dos columnas sueltas). `x`, `y` y `w` en % del área de productos, medidos desde el lado al
 * que está pegada la escena: en una escena "right" se reflejan solos. `speed` es el parallax.
 */
export type FloatSpot = { x: number; y: number; w: number; tilt: number; speed: number };

export type ExampleProduct = { name: string; price_clp: number; image: string; spot: FloatSpot };

export type HomeSection = {
  id: string;
  /** Título completo (navegación y lectores de pantalla). */
  title: string;
  /** El título se arma con una parte en serif cursiva y el resto en grotesca. */
  titleItalic: string;
  titleRest: string;
  blurb: string;
  /** Lado de la pantalla al que se pega la escena; se alternan para formar el zigzag. */
  side: "left" | "right";
  /** Categoría a la que lleva el botón "Ver todo" en Explorar. */
  category: Category;
  /** Clase de color de la mancha orgánica detrás de los productos (literal, para Tailwind). */
  blob: string;
  /** Dibujo de oficio que va como anotación en el lado libre. */
  sketch: SketchName;
  /** Productos de ejemplo mientras la sección no se conecta a datos reales. */
  examples: ExampleProduct[];
};

export const HOME_SECTIONS: HomeSection[] = [
  {
    id: "ceramica",
    title: "Cerámicas y decoración",
    titleItalic: "Cerámicas",
    titleRest: "y decoración",
    blurb: "Piezas de greda, loza y madera para vestir la mesa y la casa.",
    side: "left",
    category: "ceramica",
    blob: "bg-lilac-soft",
    sketch: "taza",
    examples: [
      { name: "Incensario espiral esmaltado", price_clp: 14000, image: "/ejemplos/ceramica-incensario-espiral.png",
        spot: { x: 0, y: 16, w: 32, tilt: -4, speed: -50 } },
      { name: "Jarrón celadón", price_clp: 28000, image: "/ejemplos/ceramica-jarron-celadon.png",
        spot: { x: 34, y: 0, w: 28, tilt: 3, speed: -85 } },
      { name: "Campanilla de hongos lila", price_clp: 16000, image: "/ejemplos/ceramica-campanilla-hongos-lila.png",
        spot: { x: 74, y: 4, w: 12, tilt: -2, speed: -30 } },
      { name: "Campanilla de pez", price_clp: 15000, image: "/ejemplos/ceramica-campanilla-pez.png",
        spot: { x: 50, y: 44, w: 9, tilt: 5, speed: -110 } },
    ],
  },
  {
    id: "fashion",
    title: "Fashion",
    titleItalic: "Fashion",
    titleRest: "",
    blurb: "Tejidos, cuero y telar: ropa y accesorios hechos para durar.",
    side: "right",
    category: "tejidos",
    blob: "bg-electric",
    sketch: "aguja",
    examples: [
      { name: "Conjunto de lino verde", price_clp: 58000, image: "/ejemplos/confeccion-conjunto-lino-verde.png",
        spot: { x: 2, y: 0, w: 16, tilt: 2, speed: -40 } },
      { name: "Broche polilla de fieltro bordada", price_clp: 12000, image: "/ejemplos/polilla-fieltro-bordada.png",
        spot: { x: 30, y: 8, w: 34, tilt: -5, speed: -95 } },
      { name: "Cuaderno de cuero verde y rosa", price_clp: 32000, image: "/ejemplos/cuero-cuaderno-verde-rosa.png",
        spot: { x: 68, y: 18, w: 24, tilt: 4, speed: -60 } },
      { name: "Cuaderno de cuero celeste con encaje", price_clp: 34000, image: "/ejemplos/cuero-cuaderno-celeste-encaje.png",
        spot: { x: 34, y: 52, w: 26, tilt: -3, speed: -120 } },
    ],
  },
  {
    id: "joyeria",
    title: "Joyería y accesorios",
    titleItalic: "Joyería",
    titleRest: "y accesorios",
    blurb: "Plata, cobre y piedras chilenas trabajadas pieza por pieza.",
    side: "left",
    category: "joyeria",
    blob: "bg-bubblegum/60",
    sketch: "anillo",
    examples: [
      { name: "Colgante estrella de cerámica", price_clp: 9000, image: "/ejemplos/accesorios-colgantes-estrellas.png",
        spot: { x: 4, y: 4, w: 28, tilt: -3, speed: -70 } },
      { name: "Portacuaderno croco verde", price_clp: 26000, image: "/ejemplos/cuero-cuaderno-penholder-verde-croc.png",
        spot: { x: 38, y: 16, w: 20, tilt: 4, speed: -40 } },
      { name: "Portacuaderno amarillo con estrella", price_clp: 24000, image: "/ejemplos/cuero-cuaderno-penholder-amarillo-estrella.png",
        spot: { x: 64, y: 0, w: 24, tilt: -5, speed: -100 } },
      { name: "Portacuaderno morado con pez", price_clp: 24000, image: "/ejemplos/cuero-cuaderno-penholder-morado-pez.png",
        spot: { x: 70, y: 56, w: 19, tilt: 3, speed: -120 } },
    ],
  },
];
