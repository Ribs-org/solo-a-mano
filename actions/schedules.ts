"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function addSchedule(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };
  const { data: artisan } = await supabase.from("artisans").select("id").eq("owner_id", user.id).maybeSingle();
  if (!artisan) return { error: "Primero crea tu perfil de artesano." };

  const day = parseInt(String(formData.get("day_of_week")), 10);
  const place = String(formData.get("place_name") ?? "").trim();
  if (!place) return { error: "Indica el nombre de la feria o lugar." };
  if (!(day >= 1 && day <= 7)) return { error: "Día inválido." };

  const { error } = await supabase.from("market_schedules").insert({
    artisan_id: artisan.id,
    day_of_week: day,
    place_name: place,
    comuna: String(formData.get("comuna") ?? "").trim(),
    time_range: String(formData.get("time_range") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  });
  if (error) return { error: "No pudimos guardar: " + error.message };
  revalidatePath("/panel/ubicaciones");
  return {};
}

export async function deleteSchedule(id: string): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.from("market_schedules").delete().eq("id", id); // RLS limita a los propios
  revalidatePath("/panel/ubicaciones");
}
