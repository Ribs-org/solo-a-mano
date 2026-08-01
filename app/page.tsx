import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";
import SelloBadge from "@/components/SelloBadge";
import type { Artisan } from "@/lib/types";

export default async function Home() {
  const supabase = await createServerSupabase();
  const { data: featured } = await supabase
    .from("artisans").select("*").eq("verification_status", "verificado")
    .order("rating_avg", { ascending: false }).limit(4).returns<Artisan[]>();

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-center gap-4 py-16 text-center">
        <Image src="/logo.png" alt="Sólo A Mano" width={140} height={140} className="rounded-full" />
        <h1 className="font-display text-4xl sm:text-5xl">Hecho a mano, hecho con sentido</h1>
        <p className="max-w-xl text-cafe/80">
          Descubre a los artesanos de las ferias de Chile: sus productos, su historia y dónde encontrarlos esta semana.
        </p>
        <form action="/explorar" className="flex w-full max-w-md gap-2">
          <input name="q" placeholder="Busca carteras, quesos, cerámica…"
            className="flex-1 rounded-full border border-beige bg-white/70 px-4 py-2" />
          <button className="rounded-full bg-terracota px-5 py-2 text-crema hover:bg-cafe">Buscar</button>
        </form>
      </section>

      <section className="py-6">
        <h2 className="mb-3 font-display text-2xl">Categorías</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link key={c.value} href={`/explorar?categoria=${c.value}`}
              className="rounded-full border border-cafe/30 px-4 py-1.5 text-sm hover:bg-ambar/30">
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
                className="overflow-hidden rounded-2xl border border-beige bg-white/70 transition hover:shadow-md">
                {a.profile_photo_url
                  ? <Image src={a.profile_photo_url} alt={a.shop_name} width={300} height={200}
                      className="h-36 w-full object-cover" />
                  : <div className="h-36 w-full bg-beige" />}
                <div className="p-3">
                  <p className="font-medium">{a.shop_name}</p>
                  <SelloBadge status={a.verification_status} />
                  {a.rating_count > 0 && (
                    <p className="mt-1 text-xs text-cafe/70">★ {Number(a.rating_avg).toFixed(1)} ({a.rating_count})</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="my-10 rounded-3xl bg-verde px-6 py-10 text-center text-crema">
        <h2 className="font-display text-2xl">¿Eres artesano?</h2>
        <p className="mx-auto mt-2 max-w-lg text-crema/90">
          Crea tu perfil gratis, muestra tu catálogo y cuéntale a todos dónde encontrarte. Si todo lo tuyo es hecho a
          mano, postula al sello Sólo A Mano.
        </p>
        <Link href="/cuenta" className="mt-4 inline-block rounded-full bg-ambar px-6 py-2 font-medium text-verde">
          Súmate gratis
        </Link>
      </section>
    </div>
  );
}
