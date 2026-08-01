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
              <Image key={u} src={u} alt={product.name} width={800} height={800} className="w-full rounded-2xl object-cover" />
            ))
          : <div className="flex aspect-square items-center justify-center rounded-2xl bg-beige text-cafe/40">Sin foto</div>}
      </div>
      <div>
        <p className="text-sm text-cafe/60">{categoryLabel(product.category)}</p>
        <h1 className="font-display text-3xl">{product.name}</h1>
        <p className="mt-1 text-xl text-terracota">{formatCLP(product.price_clp)}</p>
        {!product.available && <p className="mt-1 text-sm font-medium text-terracota">Agotado por ahora</p>}
        {product.description && <p className="mt-4 whitespace-pre-line">{product.description}</p>}

        <div className="mt-6 rounded-2xl border border-beige bg-white/60 p-4">
          <Link href={`/artesano/${artisan.slug}`} className="flex items-center gap-3 hover:text-terracota">
            {artisan.profile_photo_url
              ? <Image src={artisan.profile_photo_url} alt={artisan.shop_name} width={48} height={48}
                  className="h-12 w-12 rounded-full object-cover" />
              : <div className="h-12 w-12 rounded-full bg-ambar" />}
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
