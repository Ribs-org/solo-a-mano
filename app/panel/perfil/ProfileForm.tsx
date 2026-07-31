"use client";
import { useState, useTransition } from "react";
import { saveArtisanProfile } from "@/actions/artisans";
import { CATEGORIES } from "@/lib/constants";
import ImageUploader from "@/components/ImageUploader";
import type { Artisan } from "@/lib/types";

const input = "rounded-lg border border-beige bg-crema px-3 py-2 w-full";

export default function ProfileForm({ artisan }: { artisan: Artisan | null }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(formData: FormData) {
    start(async () => {
      setSaved(false);
      const res = await saveArtisanProfile(formData);
      if (res.error) setError(res.error);
      else { setError(null); setSaved(true); }
    });
  }

  return (
    <form action={onSubmit} className="flex max-w-2xl flex-col gap-4">
      <h1 className="font-display text-2xl">{artisan ? "Editar mi perfil" : "Crear mi perfil de artesano"}</h1>
      <label className="text-sm font-medium">Nombre del emprendimiento *
        <input name="shop_name" required minLength={3} defaultValue={artisan?.shop_name} className={input} />
      </label>
      <label className="text-sm font-medium">Tu historia
        <textarea name="story" rows={4} defaultValue={artisan?.story} className={input}
          placeholder="Cuéntanos qué haces, cómo partiste, qué hace especial lo tuyo…" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Comuna
          <input name="comuna" defaultValue={artisan?.comuna} placeholder="Ñuñoa" className={input} />
        </label>
        <label className="text-sm font-medium">Categoría principal *
          <select name="main_category" defaultValue={artisan?.main_category ?? "otros"} className={input}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUploader name="profile_photo_url" label="Foto de perfil" folder="perfil" defaultUrl={artisan?.profile_photo_url} />
        <ImageUploader name="cover_photo_url" label="Foto de portada" folder="portada" defaultUrl={artisan?.cover_photo_url} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">WhatsApp
          <input name="whatsapp_phone" defaultValue={artisan?.whatsapp_phone ?? ""} placeholder="9 1234 5678" className={input} />
        </label>
        <label className="text-sm font-medium">Correo de contacto
          <input name="contact_email" type="email" defaultValue={artisan?.contact_email ?? ""} className={input} />
        </label>
        <label className="text-sm font-medium">Instagram (URL)
          <input name="instagram_url" type="url" defaultValue={artisan?.instagram_url ?? ""}
            placeholder="https://instagram.com/tu_cuenta" className={input} />
        </label>
        <label className="text-sm font-medium">Facebook (URL)
          <input name="facebook_url" type="url" defaultValue={artisan?.facebook_url ?? ""} className={input} />
        </label>
      </div>
      {error && <p className="text-sm text-terracota">{error}</p>}
      {saved && <p className="text-sm text-verde">Guardado ✓</p>}
      <button disabled={pending} className="w-fit rounded-full bg-terracota px-6 py-2 text-crema disabled:opacity-50">
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
