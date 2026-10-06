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
  { src: "/ejemplos/ceramica-jarron-celadon.png", w: 896, h: 875, className: "-left-4 top-8 w-32 lg:w-40", speed: "-60px" },
  { src: "/ejemplos/polilla-fieltro-bordada.png", w: 680, h: 395, className: "right-0 top-10 w-44 lg:w-56", speed: "-40px" },
  { src: "/ejemplos/accesorios-colgantes-estrellas.png", w: 509, h: 587, className: "bottom-6 right-[8%] w-28 lg:w-32", speed: "-90px" },
];

export default async function Home() {
  const supabase = await createServerSupabase();
  const { data: featured } = await supabase
    .from("artisans").select("*").eq("verification_status", "verificado")
    .order("rating_avg", { ascending: false }).limit(4).returns<Artisan[]>();

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="relative isolate flex flex-col items-center gap-4 overflow-clip py-20 text-center sm:py-28">
        {/* Palabra caligráfica gigante detrás del título, como en las campañas de moda. El
            parallax va en un contenedor aparte porque el span ya usa `translate` para centrarse. */}
        <div aria-hidden="true" className="parallax pointer-events-none absolute inset-0 -z-10 [--speed:80px]">
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[78%] select-none whitespace-nowrap font-script text-[9rem] leading-none text-lilac/30 sm:text-[17rem]">
            a mano
          </span>
        </div>
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

        <p className="text-xs uppercase tracking-[0.3em] text-ink/70">Ferias de Chile · Temporada 2026</p>
        <div className="relative pb-4">
          <Sketch name="estrella" className="absolute -left-14 -top-6 hidden sm:block" />
          <h1 className="font-display text-4xl sm:text-6xl">Solo cosas hechas a mano</h1>
          <Sketch name="estrella" className="absolute -right-12 top-0 hidden rotate-12 sm:block" />
          <Sketch name="subrayado" className="absolute -bottom-3 left-1/2 max-w-full -translate-x-1/2" />
        </div>
        <p className="max-w-xl text-ink/80">
          Descubre a los artesanos de las ferias de Chile: sus productos, su historia y dónde encontrarlos esta semana.
        </p>
        <form action="/explorar" className="flex w-full max-w-md gap-2">
          <input name="q" placeholder="Busca carteras, quesos, cerámica…"
            className="flex-1 rounded-full border border-sage/50 bg-white/70 px-4 py-2" />
          <button className="rounded-full bg-lime px-5 py-2 text-ink hover:bg-fern hover:text-lime">Buscar</button>
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
              className="rounded-full border border-ink/30 px-4 py-1.5 text-sm hover:bg-lime">
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
                className="overflow-hidden rounded-2xl border border-sage/50 bg-white/70 transition hover:shadow-md">
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

      <section className="my-10 rounded-3xl bg-lilac px-6 py-10 text-center text-ink">
        <h2 className="font-display text-2xl">¿Eres artesano?</h2>
        <p className="mx-auto mt-2 max-w-lg text-ink/80">
          Crea tu perfil gratis, muestra tu catálogo y cuéntale a todos dónde encontrarte. Si todo lo tuyo es hecho a
          mano, postula al sello Sólo A Mano.
        </p>
        <Link href="/cuenta" className="mt-4 inline-block rounded-full bg-lime px-6 py-2 font-medium text-ink hover:bg-fern hover:text-lime">
          Súmate gratis
        </Link>
      </section>
    </div>
  );
}
