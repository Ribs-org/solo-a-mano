import Link from "next/link";
import SelloBadge from "@/components/SelloBadge";

export const metadata = { title: "El sello Sólo A Mano" };

export default function VerificacionPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <SelloBadge status="verificado" size="lg" />
        <h1 className="mt-4 font-display text-4xl">El sello Sólo A Mano</h1>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <p>
          El sello certifica que un emprendimiento vende <strong>únicamente productos hechos a mano</strong>. Nada de
          reventa ni producción industrial: manos, oficio y cariño.
        </p>
        <h2 className="font-display text-2xl">¿Cómo se obtiene?</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Crea tu perfil de artesano y sube tu catálogo.</li>
          <li>Envía tu solicitud desde tu panel con: una foto tuya en tu puesto, una foto tuya haciendo tu producto, y
            si quieres, un video corto del proceso.</li>
          <li>Revisamos personalmente cada solicitud. Si todo calza, tu perfil luce el sello.</li>
        </ol>
        <p className="text-sm text-cafe/70">
          Si una solicitud se rechaza, te contamos el motivo y puedes volver a postular cuando quieras.
        </p>
        <Link href="/panel/verificacion" className="mx-auto mt-2 w-fit rounded-full bg-terracota px-6 py-2 text-crema hover:bg-cafe">
          Postular al sello
        </Link>
      </div>
    </div>
  );
}
