"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";

async function myArtisanId() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, artisanId: null };
  const { data } = await supabase.from("artisans").select("id").eq("owner_id", user.id).maybeSingle();
  return { supabase, artisanId: data?.id ?? null };
}

export async function saveProduct(formData: FormData): Promise<{ error?: string }> {
  const { supabase, artisanId } = await myArtisanId();
  if (!artisanId) return { error: "Primero crea tu perfil de artesano." };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "El producto necesita un nombre." };
  const category = String(formData.get("category"));
  if (!CATEGORIES.some((c) => c.value === category)) return { error: "Categoría inválida." };

  let photos: string[] = [];
  try { photos = JSON.parse(String(formData.get("photo_urls") ?? "[]")); } catch { /* queda vacío */ }
  const publicImagePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`;
  const sentSomething = Array.isArray(photos) && photos.length > 0;
  photos = Array.isArray(photos)
    ? photos.filter((p): p is string => typeof p === "string" && p.startsWith(publicImagePrefix))
    : [];
  if (sentSomething && photos.length === 0) return { error: "Las fotos no son válidas." };
  if (photos.length > 5) photos = photos.slice(0, 5);

  const priceRaw = String(formData.get("price_clp") ?? "").replace(/\D/g, "");
  const fields = {
    name,
    description: String(formData.get("description") ?? "").trim(),
    price_clp: priceRaw ? parseInt(priceRaw, 10) : null,
    category,
    photo_urls: photos,
  };

  const id = String(formData.get("id") ?? "");
  const { error } = id
    ? await supabase.from("products").update(fields).eq("id", id).eq("artisan_id", artisanId)
    : await supabase.from("products").insert({ ...fields, artisan_id: artisanId });
  if (error) return { error: "No pudimos guardar el producto: " + error.message };
  revalidatePath("/panel/productos");
  revalidatePath("/explorar");
  return {};
}

export async function deleteProduct(id: string): Promise<void> {
  const { supabase, artisanId } = await myArtisanId();
  if (!artisanId) return;
  await supabase.from("products").delete().eq("id", id).eq("artisan_id", artisanId);
  revalidatePath("/panel/productos");
}

export async function toggleAvailable(id: string, available: boolean): Promise<void> {
  const { supabase, artisanId } = await myArtisanId();
  if (!artisanId) return;
  await supabase.from("products").update({ available }).eq("id", id).eq("artisan_id", artisanId);
  revalidatePath("/panel/productos");
}
