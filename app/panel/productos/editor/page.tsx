import { createServerSupabase } from "@/lib/supabase/server";
import ProductForm from "./ProductForm";
import type { Product } from "@/lib/types";

export const metadata = { title: "Editor de producto" };

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  let product: Product | null = null;
  if (id) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle<Product>();
    product = data;
  }
  return <ProductForm product={product} />;
}
