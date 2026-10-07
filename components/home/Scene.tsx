import Link from "next/link";
import Image from "next/image";
import Sketch from "@/components/Sketch";
import FeaturedBubbles from "@/components/home/FeaturedBubbles";
import type { FeaturedArtisan } from "@/lib/featuredArtisans";
import { formatCLP } from "@/lib/utils";
import type { ExampleProduct, HomeSection } from "@/lib/homeSections";

/**
 * Una escena de la portada: título, mancha de color y productos flotando, pegados al lado
 * que indica la sección (las escenas se alternan para formar el zigzag que recorre el hilo).
 */
export default function Scene({ section, featured }: { section: HomeSection; featured: FeaturedArtisan[] }) {
  const right = section.side === "right";
  return (
    <section id={section.id} data-side={section.side} aria-labelledby={`${section.id}-titulo`}
      className={`scene-enter relative scroll-mt-24 py-16 md:py-24 ${right ? "[--from:1]" : "[--from:-1]"}`}>
      {/* Anotación de oficio en el lado libre, por donde pasa el hilo. */}
      <Sketch name={section.sketch}
        className={`parallax absolute top-28 hidden [--speed:-20px] md:block ${right ? "left-[6%]" : "right-[6%]"}`} />

      <div className={`flex flex-col ${right ? "items-end text-right" : "items-start"}`}>
        {/* Solo el título lleva margen interior; los productos llegan hasta la orilla de su lado. */}
        <div className="max-w-xl px-4 md:px-10 lg:px-16">
          <h2 id={`${section.id}-titulo`}
            className="font-display text-5xl font-medium leading-[0.95] tracking-tight sm:text-7xl">
            <span className="font-serif font-normal italic">{section.titleItalic}</span>
            {section.titleRest && ` ${section.titleRest}`}
          </h2>
          <p className="mt-4 text-lg text-ink/70">{section.blurb}</p>
          <Link href={`/explorar?categoria=${section.category}`}
            className="mt-6 inline-block rounded-full border border-ink bg-lime px-6 py-2.5 text-sm font-medium hover:bg-ink hover:text-lime">
            Ver todo →
          </Link>
        </div>

        {/* Productos sueltos sobre una mancha que respira; nada de cajas. */}
        <div className="relative mt-12 w-full md:w-[66%] md:max-w-[1150px]">
          <div aria-hidden="true" className="parallax pointer-events-none absolute -inset-x-[5%] -inset-y-[6%] -z-10 [--speed:40px]">
            <div className={`blob h-full w-full ${section.blob}`} />
          </div>
          <ul className={`grid grid-cols-2 gap-x-6 gap-y-10 px-4 md:block md:aspect-[5/4] md:px-0 ${right ? "text-left" : ""}`}>
            {section.examples.map((p, i) => <FloatingProduct key={p.name} product={p} index={i} mirrored={right} />)}
          </ul>
        </div>
      </div>

      <FeaturedBubbles id={section.id} title={section.title} side={section.side} artisans={featured} />
    </section>
  );
}

function FloatingProduct({ product: p, index, mirrored }: { product: ExampleProduct; index: number; mirrored: boolean }) {
  const { x, y, w, tilt, speed } = p.spot;
  // En las escenas de la derecha la composición se refleja.
  const left = mirrored ? 100 - x - w : x;
  const vars = { "--x": `${left}%`, "--y": `${y}%`, "--w": `${w}%`, "--speed": `${speed}px`, rotate: `${tilt}deg` };
  return (
    <li style={vars as React.CSSProperties} className="parallax relative md:absolute md:left-(--x) md:top-(--y) md:w-(--w)">
      <Image src={p.image} alt={p.name} width={600} height={600} sizes="(min-width: 768px) 260px, 45vw"
        className="mx-auto h-auto max-h-56 w-auto origin-bottom animate-sway md:mx-0 md:max-h-none md:w-full drop-shadow-[0_14px_18px_rgb(17_17_17/0.18)]"
        // Retraso negativo: cada pieza parte en otro punto del baile, sin esperar.
        style={{ animationDelay: `${index * -0.9}s` }} />
      <HangingTag name={p.name} price={p.price_clp} />
    </li>
  );
}

/** Etiqueta de cartón atada al producto con un hilo. */
function HangingTag({ name, price }: { name: string; price: number }) {
  return (
    <div className="ml-[22%] w-fit max-w-[12rem] -rotate-3">
      <svg aria-hidden="true" viewBox="0 0 14 22" className="ml-6 h-6 w-3.5 overflow-visible">
        <path d="M7 0 C 1 7, 13 13, 7 22" fill="none" stroke="currentColor" strokeWidth="1" className="text-ink/60" />
      </svg>
      <div className="drop-shadow-[0_3px_4px_rgb(17_17_17/0.15)]">
        <div className="hang-tag relative bg-paper px-3.5 pb-2.5 pt-4">
          <span aria-hidden="true" className="absolute left-6 top-1.5 h-1.5 w-1.5 rounded-full border border-ink/40 bg-bone" />
          <p className="text-xs font-medium leading-snug">{name}</p>
          <p className="mt-1 flex items-center gap-2 font-mono text-[11px] text-ink/80">
            {formatCLP(price)}
            <span className="rounded-full bg-lime px-1.5 text-[9px] uppercase tracking-wider text-ink">Ejemplo</span>
          </p>
        </div>
      </div>
    </div>
  );
}
