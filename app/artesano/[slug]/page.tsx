import { notFound } from "next/navigation";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { categoryLabel } from "@/lib/constants";
import SelloBadge from "@/components/SelloBadge";
import ContactButtons from "@/components/ContactButtons";
import ScheduleWeek from "@/components/ScheduleWeek";
import StarRating from "@/components/StarRating";
import MasonryGrid from "@/components/MasonryGrid";
import ProductCard from "@/components/ProductCard";
import type { Artisan, MarketSchedule, Product } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("artisans").select("shop_name, story").eq("slug", slug).maybeSingle();
  return data ? { title: data.shop_name, description: data.story.slice(0, 160) } : {};
}

export default async function ArtesanoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data: artisan } = await supabase.from("artisans").select("*").eq("slug", slug).maybeSingle<Artisan>();
  if (!artisan) notFound();

  const [{ data: products }, { data: schedules }] = await Promise.all([
    supabase.from("products").select("*").eq("artisan_id", artisan.id).eq("available", true)
      .order("created_at", { ascending: false }).returns<Product[]>(),
    supabase.from("market_schedules").select("*").eq("artisan_id", artisan.id).returns<MarketSchedule[]>(),
  ]);

  return (
    <div>
      <div className="h-44 w-full bg-beige sm:h-60">
        {artisan.cover_photo_url && (
          <Image src={artisan.cover_photo_url} alt="" width={1200} height={300} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="mx-auto max-w-5xl px-4">
        <div className="-mt-12 flex flex-wrap items-end gap-4">
          {artisan.profile_photo_url
            ? <Image src={artisan.profile_photo_url} alt={artisan.shop_name} width={112} height={112}
                className="h-28 w-28 rounded-full border-4 border-crema object-cover" />
            : <div className="h-28 w-28 rounded-full border-4 border-crema bg-ambar" />}
          <div className="pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl">{artisan.shop_name}</h1>
              <SelloBadge status={artisan.verification_status} size="lg" />
            </div>
            <p className="text-sm text-cafe/70">
              {categoryLabel(artisan.main_category)}{artisan.comuna && ` · ${artisan.comuna}`}
            </p>
            {artisan.rating_count > 0 && (
              <div className="mt-1 flex items-center gap-2 text-sm">
                <StarRating value={Number(artisan.rating_avg)} />
                <span>{Number(artisan.rating_avg).toFixed(1)} · {artisan.rating_count} reseñas</span>
              </div>
            )}
          </div>
        </div>

        {artisan.story && <p className="mt-5 max-w-2xl whitespace-pre-line">{artisan.story}</p>}

        <div className="mt-5">
          <ContactButtons artisan={artisan} message={`Hola, vi tu perfil "${artisan.shop_name}" en Sólo A Mano y quiero saber más.`} />
        </div>

        <section className="mt-8">
          <h2 className="mb-3 font-display text-2xl">¿Dónde encontrarme?</h2>
          <ScheduleWeek schedules={schedules ?? []} />
        </section>

        <section className="mt-8">
          <h2 className="mb-3 font-display text-2xl">Catálogo</h2>
          {products?.length
            ? <MasonryGrid>{products.map((p) => <ProductCard key={p.id} product={p} artisan={artisan} />)}</MasonryGrid>
            : <p className="text-cafe/60">Este artesano aún no sube productos.</p>}
        </section>

        <section id="resenas" className="mt-8 pb-8">
          <h2 className="mb-3 font-display text-2xl">Reseñas</h2>
          <p className="text-cafe/60">Las reseñas llegan pronto.</p>
        </section>
      </div>
    </div>
  );
}
