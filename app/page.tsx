import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";
import SelloBadge from "@/components/SelloBadge";
import SectionNav from "@/components/home/SectionNav";
import CategorySection from "@/components/home/CategorySection";
import { HOME_SECTIONS } from "@/lib/homeSections";
import Sketch from "@/components/Sketch";
import WorkshopSection from "@/components/home/WorkshopSection";
import type { Artisan } from "@/lib/types";

// Piezas que flotan en la portada (decorativas: alt vacío).
// `speed` negativo: van más rápido que el scroll y se sienten más cerca (ver .parallax).
const HERO_PIECES = [
  { src: "/ejemplos/ceramica-jarron-celadon.png", w: 896, h: 875, className: "right-[24%] top-10 w-32 lg:w-40", speed: "-60px" },
  { src: "/ejemplos/polilla-fieltro-bordada.png", w: 680, h: 395, className: "-right-4 top-32 w-44 lg:w-60", speed: "-40px" },
  { src: "/ejemplos/accesorios-colgantes-estrellas.png", w: 509, h: 587, className: "bottom-8 right-[14%] w-28 lg:w-36", speed: "-90px" },
];

export default async function Home() {
  const supabase = await createServerSupabase();
  const { data: featured } = await supabase
    .from("artisans").select("*").eq("verification_status", "verificado")
    .order("rating_avg", { ascending: false }).limit(4).returns<Artisan[]>();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Portada tipo campaña: título enorme a la izquierda y piezas agrupadas a la derecha (asimétrico). */}
      <section className="relative isolate overflow-clip border-b border-ink py-16 sm:py-24">
        {/* Piezas flotando con el mismo baile de las fichas. Parallax y baile usan ambos
            `animation`, así que el parallax va en el contenedor y el baile en la imagen. */}
        {HERO_PIECES.map((p, i) => (
          <div key={p.src} aria-hidden="true" style={{ "--speed": p.speed } as React.CSSProperties}
            className={`parallax pointer-events-none absolute -z-10 hidden md:block ${p.className}`}>
            <Image src={p.src} alt="" width={p.w} height={p.h}
              className="h-auto w-full origin-bottom animate-sway"
              style={{ animationDelay: `${i * -1.2}s` }} />
          </div>
        ))}

        <p className="font-mono text-xs uppercase tracking-[0.2em]">Drop 01 — Temporada 2026 · Ferias de Chile</p>
        <div className="relative mt-6 max-w-4xl">
          <h1 className="font-display text-[clamp(3rem,9vw,7.5rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.03em] [font-stretch:80%]">
            Solo cosas hechas{" "}
            <span className="block font-serif text-[1.15em] font-normal normal-case italic leading-[0.9] tracking-normal text-electric [font-stretch:100%]">
              a mano
            </span>
          </h1>
          <Sketch name="subrayado" className="-mt-1 max-w-full" />
          <span aria-hidden="true"
            className="absolute -top-6 right-0 hidden -rotate-6 border border-ink bg-lime px-3 py-1.5 font-mono text-xs uppercase tracking-wider sm:block">
            100% hecho a mano
          </span>
        </div>
        <p className="mt-6 max-w-md text-ink/75">
          Descubre a los artesanos de las ferias de Chile: sus productos, su historia y dónde encontrarlos esta semana.
        </p>
        <form action="/explorar" className="mt-8 flex w-full max-w-md">
          <input name="q" placeholder="Busca carteras, quesos, cerámica…" aria-label="Buscar productos"
            className="min-w-0 flex-1 border border-ink bg-paper px-4 py-2.5" />
          <button className="border border-l-0 border-ink bg-lime px-5 py-2.5 font-mono text-sm uppercase tracking-wider text-ink hover:bg-ink hover:text-lime">
            Buscar
          </button>
        </form>
      </section>

      <SectionNav sections={HOME_SECTIONS.map(({ id, title }) => ({ id, label: title }))} />
      {HOME_SECTIONS.map((section, i) => (
        <Fragment key={section.id}>
          <CategorySection section={section} number={i + 1} />
          {i === 0 && <Sketch name="espiral" className="parallax -my-4 ml-[12%] [--speed:-30px]" />}
          {i === 1 && <Sketch name="flecha" className="parallax -my-4 ml-auto mr-[14%] [--speed:24px]" />}
        </Fragment>
      ))}

      <WorkshopSection />

      <section className="py-6">
        <h2 className="mb-3 font-display text-2xl">Categorías</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link key={c.value} href={`/explorar?categoria=${c.value}`}
              className="border border-ink/30 px-4 py-1.5 text-sm hover:bg-lime">
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {!!featured?.length && (
        <section className="py-6">
          <h2 className="mb-3 font-display text-2xl">Artesanos con sello</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((a) => (
              <Link key={a.id} href={`/artesano/${a.slug}`}
                className="overflow-hidden border border-ink/15 bg-white/70 transition hover:shadow-md">
                {a.profile_photo_url
                  ? <Image src={a.profile_photo_url} alt={a.shop_name} width={300} height={200}
                      className="h-36 w-full object-cover" />
                  : <div className="h-36 w-full bg-lilac-soft" />}
                <div className="p-3">
                  <p className="font-medium">{a.shop_name}</p>
                  <SelloBadge status={a.verification_status} />
                  {a.rating_count > 0 && (
                    <p className="mt-1 text-xs text-ink/70">★ {Number(a.rating_avg).toFixed(1)} ({a.rating_count})</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="my-10 bg-lilac px-6 py-10 text-center text-ink">
        <h2 className="font-display text-2xl">¿Eres artesano?</h2>
        <p className="mx-auto mt-2 max-w-lg text-ink/80">
          Crea tu perfil gratis, muestra tu catálogo y cuéntale a todos dónde encontrarte. Si todo lo tuyo es hecho a
          mano, postula al sello Sólo A Mano.
        </p>
        <Link href="/cuenta" className="mt-4 inline-block bg-lime uppercase tracking-wide px-6 py-2 font-medium text-ink hover:bg-fern hover:text-lime">
          Súmate gratis
        </Link>
      </section>
    </div>
  );
}
