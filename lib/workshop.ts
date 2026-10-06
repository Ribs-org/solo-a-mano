export type WorkshopPhoto = {
  src: string;
  alt: string;
  /** Leyenda escrita "a mano" bajo la polaroid. */
  caption: string;
  /** Inclinación en grados, para que el collage no se vea ordenado. */
  tilt: number;
  /** Color de la cinta washi que la "pega". */
  tape: "lilac" | "lime";
  /** true = foto del moodboard (de terceros). REEMPLAZAR antes de publicar. */
  placeholder?: boolean;
};

// ⚠ PLACEHOLDERS: todas estas fotos vienen del moodboard y no son propias.
// Ver public/moodboard-placeholder/LEEME.txt.
export const WORKSHOP_PHOTOS: WorkshopPhoto[] = [
  {
    src: "/moodboard-placeholder/greda.jpg",
    alt: "Personas modelando tazas de greda en una mesa de taller",
    caption: "clase de greda", tilt: -3, tape: "lilac", placeholder: true,
  },
  {
    src: "/moodboard-placeholder/bordado.jpg",
    alt: "Flores bordadas a mano sobre mezclilla junto a una caja de hilos",
    caption: "bordando flores", tilt: 2.5, tape: "lime", placeholder: true,
  },
  {
    src: "/moodboard-placeholder/cuentas.jpg",
    alt: "Mesa con cajas de cuentas, piedras y collares a medio armar",
    caption: "cuentas y piedras", tilt: -1.5, tape: "lime", placeholder: true,
  },
  {
    src: "/moodboard-placeholder/costura.jpg",
    alt: "Persona enhebrando una máquina de coser antigua de noche",
    caption: "hasta tarde cosiendo", tilt: 3, tape: "lilac", placeholder: true,
  },
  {
    src: "/moodboard-placeholder/journaling.jpg",
    alt: "Escritorio con cuadernos, fotos, cintas y lápices vistos desde arriba",
    caption: "cuadernos de taller", tilt: -2.5, tape: "lilac", placeholder: true,
  },
  {
    src: "/moodboard-placeholder/velas.jpg",
    alt: "Velas artesanales con flores prensadas secándose en una mesa",
    caption: "velas con flores", tilt: 1.5, tape: "lime", placeholder: true,
  },
];
