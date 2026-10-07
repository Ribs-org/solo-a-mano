/**
 * Hilo que baja por la portada en zigzag, pasando por el lado libre de cada escena
 * (derecha, izquierda, derecha), como una costura que las une. Se estira a la altura del
 * contenedor y se dibuja a medida que se recorre la página (ver .thread-path).
 * Solo en pantallas medianas o más: en celular no hay lado libre por donde pase.
 */
export default function Thread() {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 1000" preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full text-ink/60 md:block">
      <path pathLength={1} className="thread-path" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" vectorEffect="non-scaling-stroke"
        d="M 80 70 C 96 110, 98 190, 88 260
           C 80 330, 92 380, 70 430
           C 50 470, 18 470, 12 540
           C 6 610, 30 640, 22 690
           C 16 740, 60 760, 86 800
           C 98 840, 92 920, 74 995" />
    </svg>
  );
}
