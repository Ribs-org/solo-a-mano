import Link from "next/link";
import Image from "next/image";
import type { FeaturedArtisan } from "@/lib/featuredArtisans";

/** Posición de cada burbuja en el lado libre (desktop): escalonadas y de mayor a menor. */
const SPOTS = [
  { top: "0%", inset: "8%", size: "md:w-36", speed: "-50px", delay: "0s" },
  { top: "36%", inset: "36%", size: "md:w-28", speed: "-90px", delay: "-2.3s" },
  { top: "70%", inset: "0%", size: "md:w-24", speed: "-30px", delay: "-4.6s" },
];
const INITIAL_BG = ["bg-lilac", "bg-lime", "bg-bubblegum"];

/**
 * Burbujas flotantes con los artesanos destacados de una escena. En desktop van en el lado libre
 * (contrario al contenido, así también forman zigzag); en celular, en una fila bajo los productos.
 * `side` es el lado de la escena: las burbujas van al otro.
 */
export default function FeaturedBubbles({ id, title, side, artisans }: {
  id: string; title: string; side: "left" | "right"; artisans: FeaturedArtisan[];
}) {
  const bubblesOnRight = side === "left";
  const headingId = `${id}-destacados`;
  return (
    <div className={`mt-12 px-4 md:absolute md:top-[44%] md:mt-0 md:h-[26rem] md:w-[25%] md:px-0 ${bubblesOnRight ? "md:right-[2%]" : "md:left-[2%]"}`}>
      <h3 id={headingId} className={`mb-4 font-mono text-xs uppercase tracking-[0.2em] text-ink/60 md:sr-only ${bubblesOnRight ? "" : "text-right"}`}>
        Talleres destacados<span className="sr-only"> de {title}</span>
      </h3>
      <ul aria-labelledby={headingId} className={`flex flex-wrap gap-x-8 gap-y-6 md:block md:h-full ${bubblesOnRight ? "" : "justify-end"}`}>
        {artisans.map((a, i) => {
          const spot = SPOTS[i % SPOTS.length];
          // top/left/right solo tienen efecto en desktop, donde el <li> pasa a ser absoluto.
          const pos = { top: spot.top, [bubblesOnRight ? "left" : "right"]: spot.inset, "--speed": spot.speed };
          const row = `flex items-center gap-3 ${bubblesOnRight ? "" : "md:flex-row-reverse md:text-right"}`;
          const content = <><Circle artisan={a} index={i} size={spot.size} /><Label artisan={a} alignEnd={!bubblesOnRight} /></>;
          return (
            <li key={a.key} style={pos as React.CSSProperties} className="parallax md:absolute">
              {/* El vaivén va en un elemento interno: el parallax ya usa `animation` en el <li>. */}
              <div className="animate-float" style={{ animationDelay: spot.delay }}>
                {a.href
                  ? <Link href={a.href} className={`${row} rounded-full`}>{content}</Link>
                  : <div className={row}>{content}</div>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Circle({ artisan: a, index, size }: { artisan: FeaturedArtisan; index: number; size: string }) {
  return (
    <span className={`relative grid aspect-square w-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink shadow-[0_10px_20px_-8px_rgb(17_17_17/0.35)] ${size} ${a.photo ? "bg-paper" : INITIAL_BG[index % INITIAL_BG.length]}`}>
      {a.photo
        ? <Image src={a.photo} alt="" fill sizes="144px" className="object-cover" />
        : <span data-initial aria-hidden="true" className="font-serif text-4xl italic">{a.name.charAt(0)}</span>}
    </span>
  );
}

function Label({ artisan: a, alignEnd }: { artisan: FeaturedArtisan; alignEnd: boolean }) {
  return (
    <span className="max-w-[9rem]">
      <span className="block text-sm font-medium leading-tight">{a.name}</span>
      <span className={`mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-ink/60 ${alignEnd ? "md:justify-end" : ""}`}>
        {a.comuna}
        {a.example && <span className="rounded-full bg-lime px-1.5 text-[9px] uppercase tracking-wider text-ink">Ejemplo</span>}
      </span>
    </span>
  );
}
