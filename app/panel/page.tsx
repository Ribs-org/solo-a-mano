import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import SelloBadge from "@/components/SelloBadge";
import type { Artisan } from "@/lib/types";

export const metadata = { title: "Mi panel" };

export default async function PanelPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: artisan } = await supabase
    .from("artisans").select("*").eq("owner_id", user!.id).maybeSingle<Artisan>();

  if (!artisan) {
    return (
      <div className="rounded-2xl border border-beige bg-white/60 p-8 text-center">
        <h1 className="font-display text-2xl">¡Bienvenido a Sólo A Mano!</h1>
        <p className="mt-2">Aún no tienes un perfil de emprendimiento. Créalo para mostrar tus productos.</p>
        <Link href="/panel/perfil" className="mt-4 inline-block rounded-full bg-terracota px-6 py-2 text-crema">
          Crear mi perfil de artesano
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-3xl">{artisan.shop_name}</h1>
        <SelloBadge status={artisan.verification_status} />
      </div>
      <p className="mt-1 text-sm text-cafe/70">
        Tu página pública: <Link className="underline" href={`/artesano/${artisan.slug}`}>/artesano/{artisan.slug}</Link>
      </p>
    </div>
  );
}
