import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

export async function uploadImage(file: File, folder: string): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión");
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/jpeg",
  });
  const path = `${user.id}/${folder}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("images").upload(path, compressed, { contentType: "image/jpeg" });
  if (error) throw new Error("No pudimos subir la imagen: " + error.message);
  return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
}
