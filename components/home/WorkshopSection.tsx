import Image from "next/image";
import Reveal from "@/components/Reveal";
import { WORKSHOP_PHOTOS } from "@/lib/workshop";

const TAPE = { lilac: "bg-lilac/70", lime: "bg-lime/80" };
/** Velocidad de parallax por polaroid: alternadas para que se sientan como hojas sueltas. */
const SPEEDS = ["28px", "-18px", "36px", "-26px", "18px", "-34px"];

/** Collage de polaroids del proceso, como un cuaderno de taller. */
export default function WorkshopSection() {
  return (
    <section aria-labelledby="taller-titulo" className="py-16">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/60">El proceso</p>
        <h2 id="taller-titulo" className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.02em] [font-stretch:85%] sm:text-6xl">
          Desde el <span className="font-serif font-normal normal-case italic tracking-normal [font-stretch:100%]">taller</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink/75">
          Detrás de cada pieza hay manos, horas y una mesa llena de materiales. Así se ve antes de llegar a la feria.
        </p>
      </div>

      <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-8">
        {WORKSHOP_PHOTOS.map((p, i) => (
          <li key={p.src} className="parallax" style={{ "--speed": SPEEDS[i % SPEEDS.length] } as React.CSSProperties}>
            <Reveal>
              <figure style={{ "--tilt": `${p.tilt}deg` } as React.CSSProperties}
                className="relative rotate-(--tilt) bg-paper p-2.5 pb-1 shadow-[0_6px_18px_-6px_rgb(23_48_31/0.35)] transition-transform duration-300 hover:rotate-0 hover:scale-[1.03]">
                <span aria-hidden="true"
                  className={`absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3 ${TAPE[p.tape]}`} />
                <div className="relative aspect-[4/5] overflow-hidden bg-lilac-soft">
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width: 640px) 300px, 45vw" className="object-cover" />
                </div>
                <figcaption className="py-2 text-center font-script text-2xl leading-none text-ink sm:text-3xl">
                  {p.caption}
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
