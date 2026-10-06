import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { formatCLP } from "@/lib/utils";
import { categoryLabel } from "@/lib/constants";
import ContactButtons from "@/components/ContactButtons";
import SelloBadge from "@/components/SelloBadge";
import type { Artisan, Product } from "@/lib/types";

type ProductWithArtisan = Product & { artisans: Artisan };

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("products").select("name, description").eq("id", id).maybeSingle();
  return data ? { title: data.name, description: data.description.slice(0, 160) } : {};
}

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: product } = await supabase
    .from("products").select("*, artisans(*)").eq("id", id).maybeSingle<ProductWithArtisan>();
  if (!product) notFound();
  const artisan = product.artisans;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        {product.photo_urls.length
          ? product.photo_urls.map((u) => (
              <Image key={u} src={u} alt={product.name} width={800} height={800} className="w-full object-cover" />
            ))
          : <div className="flex aspect-square items-center justify-center bg-lilac-soft text-ink/60">Sin foto</div>}
      </div>
      <div>
        <p className="text-sm text-ink/60">{categoryLabel(product.category)}</p>
        <h1 className="font-display text-3xl">{product.name}</h1>
        <p className="mt-1 text-xl font-semibold text-ink">{formatCLP(product.price_clp)}</p>
        {!product.available && <p className="mt-1 text-sm font-medium text-copihue">Agotado por ahora</p>}
        {product.description && <p className="mt-4 whitespace-pre-line">{product.description}</p>}

        <div className="mt-6 border border-ink/15 bg-white/60 p-4">
          <Link href={`/artesano/${artisan.slug}`} className="flex items-center gap-3 hover:bg-lime">
            {artisan.profile_photo_url
              ? <Image src={artisan.profile_photo_url} alt={artisan.shop_name} width={48} height={48}
                  className="h-12 w-12 rounded-full object-cover" />
              : <div className="h-12 w-12 rounded-full bg-lilac" />}
            <div>
              <p className="font-medium">{artisan.shop_name}</p>
              <SelloBadge status={artisan.verification_status} />
            </div>
          </Link>
          <div className="mt-3">
            <ContactButtons artisan={artisan}
              message={`Hola, vi "${product.name}" en Sólo A Mano y me interesa. ¿Sigue disponible?`} />
          </div>
        </div>
      </div>
    </div>
  );
}
