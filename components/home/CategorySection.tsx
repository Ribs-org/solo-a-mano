import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import Sketch from "@/components/Sketch";
import { formatCLP } from "@/lib/utils";
import type { HomeSection } from "@/lib/homeSections";

/** `number` es la posición de la sección en la portada; se muestra como "N° 01". */
export default function CategorySection({ section, number }: { section: HomeSection; number: number }) {
  const { theme } = section;
  return (
    <section id={section.id} aria-labelledby={`${section.id}-titulo`} className="scroll-mt-32 py-6">
      <Reveal className={`relative rounded-3xl px-6 py-10 sm:px-10 ${theme.block}`}>
        <Sketch name={section.sketch} className="absolute -top-14 right-4 sm:right-10" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`text-xs uppercase tracking-[0.25em] ${theme.muted}`}>N° {String(number).padStart(2, "0")}</p>
            <h2 id={`${section.id}-titulo`} className="mt-1 font-display text-3xl sm:text-4xl">{section.title}</h2>
            <p className={`mt-2 max-w-lg ${theme.muted}`}>{section.blurb}</p>
          </div>
          <Link href={`/explorar?categoria=${section.category}`}
            className={`rounded-full px-5 py-2 font-medium ${theme.button}`}>
            Ver todo →
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
          {section.examples.map((p, i) => (
            <li key={p.name}>
              {/* Ficha editorial: foto sobre papel y, debajo, NOMBRE a la izquierda y precio a la derecha. */}
              <div className="relative aspect-[4/5] bg-paper">
                <div className={`absolute inset-0 ${theme.photo}`} />
                {p.image && (
                  <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 270px, 50vw"
                    className="origin-bottom animate-sway object-contain p-3"
                    // Retraso negativo: cada foto parte en otro punto del baile, sin esperar.
                    style={{ animationDelay: `${i * -0.9}s` }} />
                )}
                <span className="absolute left-2 top-2 rounded-full bg-ink px-2.5 py-0.5 text-[11px] text-paper">Ejemplo</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-3 text-[11px] uppercase tracking-wider">
                <p className="font-medium">{p.name}</p>
                <p className={`shrink-0 ${theme.muted}`}>{formatCLP(p.price_clp)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
