import type { Category } from "@/lib/constants";
import type { SketchName } from "@/lib/sketches";

/** `image` es una ruta dentro de /public; sin ella la tarjeta muestra solo el color de la sección. */
export type ExampleProduct = { name: string; price_clp: number; image?: string };

export type HomeSection = {
  id: string;
  title: string;
  blurb: string;
  /** Categoría a la que lleva el botón "Ver todo" en Explorar. */
  category: Category;
  /** Clases completas (Tailwind solo genera las que aparecen literalmente). */
  theme: { block: string; muted: string; photo: string; button: string };
  /** Dibujo de oficio que asoma en la esquina superior del bloque. */
  sketch: SketchName;
  /** Productos de ejemplo mientras la sección no se conecta a datos reales. */
  examples: ExampleProduct[];
};

export const HOME_SECTIONS: HomeSection[] = [
  {
    id: "ceramica",
    title: "Cerámicas y decoración",
    blurb: "Piezas de greda, loza y madera para vestir la mesa y la casa.",
    category: "ceramica",
    sketch: "taza",
    theme: {
      block: "bg-lilac-soft text-ink",
      muted: "text-ink/75",
      photo: "bg-lilac/40",
      button: "bg-ink text-bone hover:bg-lime hover:text-ink",
    },
    examples: [
      { name: "Incensario espiral esmaltado", price_clp: 14000, image: "/ejemplos/ceramica-incensario-espiral.png" },
      { name: "Jarrón celadón", price_clp: 28000, image: "/ejemplos/ceramica-jarron-celadon.png" },
      { name: "Campanilla de hongos lila", price_clp: 16000, image: "/ejemplos/ceramica-campanilla-hongos-lila.png" },
      { name: "Campanilla de pez", price_clp: 15000, image: "/ejemplos/ceramica-campanilla-pez.png" },
    ],
  },
  {
    id: "fashion",
    title: "Fashion",
    blurb: "Tejidos, cuero y telar: ropa y accesorios hechos para durar.",
    category: "tejidos",
    sketch: "aguja",
    theme: {
      block: "bg-electric text-paper",
      muted: "text-paper/80",
      photo: "bg-electric-deep/15",
      button: "bg-lime text-ink hover:bg-paper",
    },
    examples: [
      { name: "Conjunto de lino verde", price_clp: 58000, image: "/ejemplos/confeccion-conjunto-lino-verde.png" },
      { name: "Broche polilla de fieltro bordada", price_clp: 12000, image: "/ejemplos/polilla-fieltro-bordada.png" },
      { name: "Cuaderno de cuero verde y rosa", price_clp: 32000, image: "/ejemplos/cuero-cuaderno-verde-rosa.png" },
      { name: "Cuaderno de cuero celeste con encaje", price_clp: 34000, image: "/ejemplos/cuero-cuaderno-celeste-encaje.png" },
    ],
  },
  {
    id: "joyeria",
    title: "Joyería y accesorios",
    blurb: "Plata, cobre y piedras chilenas trabajadas pieza por pieza.",
    category: "joyeria",
    sketch: "anillo",
    theme: {
      block: "bg-sage-soft text-ink",
      muted: "text-ink/75",
      photo: "bg-sage/40",
      button: "bg-fern text-bone hover:bg-lime hover:text-ink",
    },
    examples: [
      { name: "Colgante estrella de cerámica", price_clp: 9000, image: "/ejemplos/accesorios-colgantes-estrellas.png" },
      { name: "Portacuaderno croco verde", price_clp: 26000, image: "/ejemplos/cuero-cuaderno-penholder-verde-croc.png" },
      { name: "Portacuaderno amarillo con estrella", price_clp: 24000, image: "/ejemplos/cuero-cuaderno-penholder-amarillo-estrella.png" },
      { name: "Portacuaderno morado con pez", price_clp: 24000, image: "/ejemplos/cuero-cuaderno-penholder-morado-pez.png" },
    ],
  },
];
