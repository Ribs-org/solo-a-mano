import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import VerificationForm from "./VerificationForm";
import SelloBadge from "@/components/SelloBadge";
import type { VerificationRequest } from "@/lib/types";

export const metadata = { title: "Verificación" };

export default async function PanelVerificacionPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: artisan } = await supabase
    .from("artisans").select("id, verification_status").eq("owner_id", user!.id).maybeSingle();
  if (!artisan) return <p>Primero <Link className="underline" href="/panel/perfil">crea tu perfil</Link>.</p>;

  const { data: lastRequest } = await supabase
    .from("verification_requests").select("*").eq("artisan_id", artisan.id)
    .order("created_at", { ascending: false }).limit(1).maybeSingle<VerificationRequest>();

  if (artisan.verification_status === "verificado") {
    return (
      <div className="text-center">
        <SelloBadge status="verificado" size="lg" />
        <p className="mt-3">¡Tu emprendimiento ya tiene el sello Sólo A Mano! 🎉</p>
      </div>
    );
  }
  if (artisan.verification_status === "pendiente") {
    return <p>Tu solicitud está <strong>en revisión</strong>. Te avisaremos cuando esté lista.</p>;
  }
  return (
    <div className="flex max-w-xl flex-col gap-4">
      {artisan.verification_status === "rechazado" && lastRequest && (
        <div className="rounded-xl border border-terracota/40 bg-terracota/10 p-4 text-sm">
          <p className="font-medium">Tu solicitud anterior fue rechazada.</p>
          {lastRequest.admin_comment && <p className="mt-1">Motivo: {lastRequest.admin_comment}</p>}
          <p className="mt-1">Puedes corregir y volver a postular aquí mismo.</p>
        </div>
      )}
      <VerificationForm />
    </div>
  );
}
