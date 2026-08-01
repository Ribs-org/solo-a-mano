import Link from "next/link";
import Image from "next/image";
import { formatCLP } from "@/lib/utils";
import type { Product, VerificationStatus } from "@/lib/types";

type CardProduct = Pick<Product, "id" | "name" | "price_clp" | "photo_urls">;
type CardArtisan = { slug: string; shop_name: string; verification_status: VerificationStatus };

export default function ProductCard({ product, artisan }: { product: CardProduct; artisan: CardArtisan }) {
  return (
    <div className="break-inside-avoid overflow-hidden rounded-2xl border border-beige bg-white/70 transition hover:shadow-md">
      <Link href={`/producto/${product.id}`}>
        {product.photo_urls[0]
          ? <Image src={product.photo_urls[0]} alt={product.name} width={480} height={480}
              className="w-full object-cover" />
          : <div className="flex aspect-square w-full items-center justify-center bg-beige text-cafe/40">Sin foto</div>}
      </Link>
      <div className="p-3">
        <Link href={`/producto/${product.id}`} className="font-medium hover:text-terracota">{product.name}</Link>
        <p className="text-sm text-cafe/80">{formatCLP(product.price_clp)}</p>
        <Link href={`/artesano/${artisan.slug}`}
          className="mt-1 flex items-center gap-1 text-xs text-cafe/60 hover:text-terracota">
          <span>{artisan.shop_name}</span>
          {artisan.verification_status === "verificado" && (
            <span className="text-terracota" title="Sello Sólo A Mano">✓</span>
          )}
        </Link>
      </div>
    </div>
  );
}
