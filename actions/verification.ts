"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function submitVerificationRequest(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };
  const { data: artisan } = await supabase
    .from("artisans").select("id, shop_name, verification_status").eq("owner_id", user.id).maybeSingle();
  if (!artisan) return { error: "Primero crea tu perfil de artesano." };
  if (artisan.verification_status === "pendiente") return { error: "Ya tienes una solicitud en revisión." };
  if (artisan.verification_status === "verificado") return { error: "¡Tu emprendimiento ya tiene el sello!" };

  const stallPhoto = String(formData.get("stall_photo_path") ?? "");
  const makingPhoto = String(formData.get("making_photo_path") ?? "");
  if (!stallPhoto || !makingPhoto) return { error: "Las dos fotos son obligatorias." };

  const { error } = await supabase.from("verification_requests").insert({
    artisan_id: artisan.id,
    stall_photo_path: stallPhoto,
    making_photo_path: makingPhoto,
    video_path: String(formData.get("video_path") ?? "") || null,
    video_url: String(formData.get("video_url") ?? "").trim() || null,
    message: String(formData.get("message") ?? "").trim(),
  });
  if (error) return { error: "No pudimos enviar tu solicitud: " + error.message };

  revalidatePath("/panel/verificacion");
  return {};
}
