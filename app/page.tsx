import SectionNav from "@/components/home/SectionNav";
import Scene from "@/components/home/Scene";
import Thread from "@/components/home/Thread";
import Sketch from "@/components/Sketch";
import { HOME_SECTIONS } from "@/lib/homeSections";

// Portada en tres escenas en zigzag (izquierda, derecha, izquierda) unidas por un hilo.
// "Desde el taller", categorías y artesanos con sello quedan fuera de la portada por ahora.
export default function Home() {
  return (
    <div className="relative mx-auto max-w-6xl overflow-x-clip px-4">
      <Thread />

      {/* Portada breve, pegada a la izquierda; a la derecha nace el hilo desde una mancha lima. */}
      <section className="relative grid items-center gap-10 py-16 md:grid-cols-[1.5fr_1fr] md:py-24">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/70">Temporada 2026 · Ferias de Chile</p>
          <h1 className="mt-5 font-display text-5xl font-medium leading-[0.95] tracking-tight sm:text-7xl">
            <span className="font-serif font-normal italic">Solo cosas</span>{" "}
            <span className="sm:block">hechas a mano</span>
          </h1>
          <Sketch name="subrayado" className="mt-1 max-w-full" />
          <p className="mt-6 max-w-md text-lg text-ink/70">
            Descubre a los artesanos de las ferias de Chile: sus productos, su historia y dónde encontrarlos esta semana.
          </p>
          <form action="/explorar" className="mt-8 flex w-full max-w-md gap-2">
            <input name="q" placeholder="Busca carteras, quesos, cerámica…" aria-label="Buscar productos"
              className="min-w-0 flex-1 rounded-full border border-ink/20 bg-paper px-5 py-2.5" />
            <button className="rounded-full border border-ink bg-lime px-6 py-2.5 text-sm font-medium text-ink hover:bg-ink hover:text-lime">
              Buscar
            </button>
          </form>
        </div>
        <div aria-hidden="true" className="relative hidden h-72 md:block">
          <div className="parallax absolute inset-[8%] [--speed:50px]">
            <div className="blob h-full w-full bg-lime" />
          </div>
          <Sketch name="estrella" className="parallax absolute left-[18%] top-[12%] [--speed:-40px]" />
          <Sketch name="estrella" className="parallax absolute bottom-[14%] right-[20%] rotate-12 [--speed:-70px]" />
        </div>
      </section>

      <SectionNav sections={HOME_SECTIONS.map(({ id, title }) => ({ id, label: title }))} />
      {HOME_SECTIONS.map((section) => <Scene key={section.id} section={section} />)}
    </div>
  );
}
