import { createServerSupabase } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import type { Artisan } from "@/lib/types";

export const metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: artisan } = await supabase
    .from("artisans").select("*").eq("owner_id", user!.id).maybeSingle<Artisan>();
  return <ProfileForm artisan={artisan} />;
}
