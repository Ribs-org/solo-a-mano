import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { deleteProduct, toggleAvailable } from "@/actions/products";
import { formatCLP } from "@/lib/utils";
import type { Product } from "@/lib/types";

export const metadata = { title: "Mis productos" };

export default async function ProductosPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: artisan } = await supabase.from("artisans").select("id").eq("owner_id", user!.id).maybeSingle();
  if (!artisan) return <p>Primero <Link className="underline" href="/panel/perfil">crea tu perfil</Link>.</p>;

  const { data: products } = await supabase
    .from("products").select("*").eq("artisan_id", artisan.id)
    .order("created_at", { ascending: false }).returns<Product[]>();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Mis productos</h1>
        <Link href="/panel/productos/editor" className="rounded-full bg-terracota px-4 py-1.5 text-sm text-crema">
          + Nuevo producto
        </Link>
      </div>
      {!products?.length && <p className="text-cafe/70">Aún no tienes productos. ¡Sube el primero!</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {products?.map((p) => (
          <li key={p.id} className="flex gap-3 rounded-xl border border-beige bg-white/60 p-3">
            {p.photo_urls[0]
              ? <Image src={p.photo_urls[0]} alt={p.name} width={80} height={80} className="h-20 w-20 rounded-lg object-cover" />
              : <div className="h-20 w-20 rounded-lg bg-beige" />}
            <div className="flex-1">
              <p className="font-medium">{p.name} {!p.available && <span className="text-xs text-terracota">(agotado)</span>}</p>
              <p className="text-sm text-cafe/70">{formatCLP(p.price_clp)}</p>
              <div className="mt-1 flex gap-3 text-xs">
                <Link href={`/panel/productos/editor?id=${p.id}`} className="underline">Editar</Link>
                <form action={toggleAvailable.bind(null, p.id, !p.available)}>
                  <button className="underline">{p.available ? "Marcar agotado" : "Marcar disponible"}</button>
                </form>
                <form action={deleteProduct.bind(null, p.id)}>
                  <button className="text-terracota underline">Eliminar</button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
