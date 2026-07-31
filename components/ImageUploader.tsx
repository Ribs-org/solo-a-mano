"use client";
import { useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/upload";

export default function ImageUploader({
  name, label, folder, defaultUrl,
}: { name: string; label: string; folder: string; defaultUrl?: string | null }) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setUrl(await uploadImage(file, folder));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input type="hidden" name={name} value={url} />
      {url && <Image src={url} alt={label} width={160} height={160} className="rounded-xl object-cover" />}
      <input type="file" accept="image/*" onChange={onChange} disabled={busy}
        className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-beige file:px-3 file:py-1.5" />
      {busy && <p className="text-xs text-cafe/60">Subiendo…</p>}
      {error && <p className="text-xs text-terracota">{error}</p>}
    </div>
  );
}
