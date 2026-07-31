"use client";
import { useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/upload";

export default function MultiImageUploader({
  name, defaultUrls = [], max = 5,
}: { name: string; defaultUrls?: string[]; max?: number }) {
  const [urls, setUrls] = useState<string[]>(defaultUrls);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (urls.length + files.length > max) {
      setError(`Máximo ${max} fotos por producto.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const nuevos = [];
      for (const f of files) nuevos.push(await uploadImage(f, "productos"));
      setUrls([...urls, ...nuevos]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Fotos (hasta {max})</label>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div className="flex flex-wrap gap-2">
        {urls.map((u, i) => (
          <div key={u} className="relative">
            <Image src={u} alt={`Foto ${i + 1}`} width={96} height={96} className="h-24 w-24 rounded-lg object-cover" />
            <button type="button" onClick={() => setUrls(urls.filter((x) => x !== u))}
              className="absolute -right-1 -top-1 rounded-full bg-terracota px-1.5 text-xs text-crema">✕</button>
          </div>
        ))}
      </div>
      {urls.length < max && (
        <input type="file" accept="image/*" multiple onChange={onChange} disabled={busy}
          className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-beige file:px-3 file:py-1.5" />
      )}
      {busy && <p className="text-xs text-cafe/60">Subiendo…</p>}
      {error && <p className="text-xs text-terracota">{error}</p>}
    </div>
  );
}
