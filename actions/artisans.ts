"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";

export async function saveArtisanProfile(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const shopName = String(formData.get("shop_name") ?? "").trim();
  if (shopName.length < 3) return { error: "El nombre del emprendimiento necesita al menos 3 letras." };
  const category = String(formData.get("main_category"));
  if (!CATEGORIES.some((c) => c.value === category)) return { error: "Categoría inválida." };

  const safeUrl = (raw: FormDataEntryValue | null) => {
    const v = String(raw ?? "").trim();
    if (!v) return null;
    return v.startsWith("https://") || v.startsWith("http://") ? v : null;
  };

  const fields = {
    shop_name: shopName,
    story: String(formData.get("story") ?? "").trim(),
    comuna: String(formData.get("comuna") ?? "").trim(),
    main_category: category,
    profile_photo_url: String(formData.get("profile_photo_url") ?? "") || null,
    cover_photo_url: String(formData.get("cover_photo_url") ?? "") || null,
    instagram_url: safeUrl(formData.get("instagram_url")),
    facebook_url: safeUrl(formData.get("facebook_url")),
    whatsapp_phone: String(formData.get("whatsapp_phone") ?? "").trim() || null,
    contact_email: String(formData.get("contact_email") ?? "").trim() || null,
  };

  const { data: existing } = await supabase.from("artisans").select("id, slug").eq("owner_id", user.id).maybeSingle();

  if (existing) {
    const { error } = await supabase.from("artisans").update(fields).eq("id", existing.id);
    if (error) return { error: "No pudimos guardar: " + error.message };
    revalidatePath(`/artesano/${existing.slug}`);
  } else {
    let slug = slugify(shopName);
    if (!slug) slug = crypto.randomUUID().slice(0, 8);
    const { data: clash } = await supabase.from("artisans").select("id").eq("slug", slug).maybeSingle();
    if (clash) slug = `${slug}-${crypto.randomUUID().slice(0, 4)}`;
    const { error } = await supabase.from("artisans").insert({ ...fields, owner_id: user.id, slug });
    if (error) return { error: "No pudimos crear tu perfil: " + error.message };
    await supabase.from("profiles").update({ display_name: shopName }).eq("id", user.id);
  }
  revalidatePath("/panel");
  return {};
}
