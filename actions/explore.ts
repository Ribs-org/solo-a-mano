"use server";
import { createServerSupabase } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import type { Product, VerificationStatus } from "@/lib/types";

// Nota: los archivos "use server" solo pueden exportar funciones async;
// por eso PAGE_SIZE vive en lib/constants.ts (los type exports se borran al compilar y no molestan).

export type ExploreItem = Pick<Product, "id" | "name" | "price_clp" | "photo_urls"> & {
  artisans: { slug: string; shop_name: string; comuna: string; verification_status: VerificationStatus };
};

export async function fetchProducts(opts: {
  page: number; category?: string; comuna?: string; verifiedOnly?: boolean; q?: string;
}): Promise<ExploreItem[]> {
  const supabase = await createServerSupabase();
  let query = supabase
    .from("products")
    .select("id,name,price_clp,photo_urls,artisans!inner(slug,shop_name,comuna,verification_status)")
    .eq("available", true)
    .order("created_at", { ascending: false })
    .range(opts.page * PAGE_SIZE, opts.page * PAGE_SIZE + PAGE_SIZE - 1);

  if (opts.category) query = query.eq("category", opts.category);
  if (opts.comuna) query = query.ilike("artisans.comuna", `%${opts.comuna}%`);
  if (opts.verifiedOnly) query = query.eq("artisans.verification_status", "verificado");
  const q = opts.q ? opts.q.replace(/[,()]/g, " ").trim() : "";
  if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as unknown as ExploreItem[];
}
