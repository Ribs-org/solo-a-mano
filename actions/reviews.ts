"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function submitReview(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Inicia sesión para dejar tu reseña." };

  const artisanId = String(formData.get("artisan_id"));
  const slug = String(formData.get("slug"));
  const stars = parseInt(String(formData.get("stars")), 10);
  const comment = String(formData.get("comment") ?? "").trim();
  if (!(stars >= 1 && stars <= 5)) return { error: "Elige de 1 a 5 estrellas." };

  const { data: own } = await supabase.from("artisans").select("id").eq("owner_id", user.id).eq("id", artisanId).maybeSingle();
  if (own) return { error: "No puedes reseñar tu propio emprendimiento." };

  const { data: existing } = await supabase
    .from("reviews").select("id")
    .eq("artisan_id", artisanId).eq("author_id", user.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("reviews").update({ stars, comment }).eq("id", existing.id)
    : await supabase.from("reviews").insert({ artisan_id: artisanId, author_id: user.id, stars, comment });
  if (error) return { error: "No pudimos guardar tu reseña: " + error.message };
  revalidatePath(`/artesano/${slug}`);
  return {};
}

export async function deleteReview(artisanId: string, slug: string): Promise<void> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("reviews").delete().eq("artisan_id", artisanId).eq("author_id", user.id);
  revalidatePath(`/artesano/${slug}`);
}
