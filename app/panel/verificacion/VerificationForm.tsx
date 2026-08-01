"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitVerificationRequest } from "@/actions/verification";
import { uploadVerificationFile } from "@/lib/upload-verification";

function FileField({ label, kind, name, required, accept, onPath }: {
  label: string; kind: "puesto" | "haciendo" | "video"; name: string;
  required?: boolean; accept: string; onPath: (name: string, path: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError(null);
    try {
      onPath(name, await uploadVerificationFile(file, kind));
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}{required && " *"}</label>
      <input type="file" accept={accept} onChange={onChange} disabled={busy}
        className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-beige file:px-3 file:py-1.5" />
      {busy && <p className="text-xs text-cafe/60">Subiendo…</p>}
      {done && <p className="text-xs text-verde">Listo ✓</p>}
      {error && <p className="text-xs text-terracota">{error}</p>}
    </div>
  );
}

export default function VerificationForm() {
  const router = useRouter();
  const [paths, setPaths] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const setPath = (name: string, path: string) => setPaths((p) => ({ ...p, [name]: path }));

  function onSubmit(formData: FormData) {
    Object.entries(paths).forEach(([k, v]) => formData.set(k, v));
    start(async () => {
      const res = await submitVerificationRequest(formData);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <h1 className="font-display text-2xl">Postular al sello Sólo A Mano</h1>
      <p className="text-sm text-cafe/70">
        Necesitamos ver que lo tuyo es 100% hecho a mano. Sube una foto tuya en tu puesto y una foto tuya haciendo tu
        producto. Un video corto del proceso suma puntos (opcional).
      </p>
      <FileField label="Foto en tu puesto" kind="puesto" name="stall_photo_path" required accept="image/*" onPath={setPath} />
      <FileField label="Foto haciendo tu producto" kind="haciendo" name="making_photo_path" required accept="image/*" onPath={setPath} />
      <FileField label="Video del proceso (opcional, máx. 50 MB)" kind="video" name="video_path" accept="video/*" onPath={setPath} />
      <label className="text-sm font-medium">…o link de YouTube (opcional)
        <input name="video_url" type="url" placeholder="https://youtube.com/…"
          className="w-full rounded-lg border border-beige bg-crema px-3 py-2" />
      </label>
      <label className="text-sm font-medium">Cuéntanos de tu proceso
        <textarea name="message" rows={3} className="w-full rounded-lg border border-beige bg-crema px-3 py-2"
          placeholder="Qué haces, con qué materiales, hace cuánto…" />
      </label>
      {error && <p className="text-sm text-terracota">{error}</p>}
      <button disabled={pending || !paths.stall_photo_path || !paths.making_photo_path}
        className="w-fit rounded-full bg-terracota px-6 py-2 text-crema hover:bg-cafe disabled:opacity-50 disabled:hover:bg-terracota">
        {pending ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
