import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export async function uploadVerificationFile(file: File, kind: "puesto" | "haciendo" | "video"): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión");

  let toUpload: File | Blob = file;
  let ext = "jpg";
  if (kind === "video") {
    if (file.size > MAX_VIDEO_BYTES) throw new Error("El video supera los 50 MB. Puedes pegar un link de YouTube.");
    ext = file.name.split(".").pop() ?? "mp4";
  } else {
    toUpload = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 2000, useWebWorker: true, fileType: "image/jpeg" });
  }
  const path = `${user.id}/${kind}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("verification").upload(path, toUpload);
  if (error) throw new Error("No pudimos subir el archivo: " + error.message);
  return path;
}
