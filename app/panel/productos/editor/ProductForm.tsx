"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProduct } from "@/actions/products";
import { CATEGORIES } from "@/lib/constants";
import MultiImageUploader from "@/components/MultiImageUploader";
import type { Product } from "@/lib/types";

const input = "rounded-lg border border-beige bg-crema px-3 py-2 w-full";

export default function ProductForm({ product }: { product: Product | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    start(async () => {
      const res = await saveProduct(formData);
      if (res.error) setError(res.error);
      else router.push("/panel/productos");
    });
  }

  return (
    <form action={onSubmit} className="flex max-w-xl flex-col gap-4">
      <h1 className="font-display text-2xl">{product ? "Editar producto" : "Nuevo producto"}</h1>
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <label className="text-sm font-medium">Nombre *
        <input name="name" required minLength={2} defaultValue={product?.name} className={input} />
      </label>
      <label className="text-sm font-medium">Descripción
        <textarea name="description" rows={3} defaultValue={product?.description} className={input} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Precio referencial (CLP)
          <input name="price_clp" inputMode="numeric" defaultValue={product?.price_clp ?? ""}
            placeholder="Vacío = precio a convenir" className={input} />
        </label>
        <label className="text-sm font-medium">Categoría *
          <select name="category" defaultValue={product?.category ?? "otros"} className={input}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
      </div>
      <MultiImageUploader name="photo_urls" defaultUrls={product?.photo_urls} max={5} />
      {error && <p className="text-sm text-terracota">{error}</p>}
      <button disabled={pending} className="w-fit rounded-full bg-terracota px-6 py-2 text-crema hover:bg-cafe disabled:opacity-50 disabled:hover:bg-terracota">
        {pending ? "Guardando…" : "Guardar producto"}
      </button>
    </form>
  );
}
