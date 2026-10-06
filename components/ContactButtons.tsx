import { buildWhatsAppLink } from "@/lib/utils";
import type { Artisan } from "@/lib/types";

type ContactArtisan = Pick<Artisan, "whatsapp_phone" | "instagram_url" | "facebook_url" | "contact_email">;
const btn = "px-4 py-1.5 text-sm font-medium";

export default function ContactButtons({ artisan, message }: { artisan: ContactArtisan; message: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {artisan.whatsapp_phone && (
        <a href={buildWhatsAppLink(artisan.whatsapp_phone, message)} target="_blank" rel="noopener noreferrer"
          className={`${btn} bg-fern text-bone hover:opacity-90`}>WhatsApp</a>
      )}
      {artisan.instagram_url && (
        <a href={artisan.instagram_url} target="_blank" rel="noopener noreferrer"
          className={`${btn} bg-lime text-ink hover:bg-fern hover:text-lime`}>Instagram</a>
      )}
      {artisan.facebook_url && (
        <a href={artisan.facebook_url} target="_blank" rel="noopener noreferrer"
          className={`${btn} bg-lime text-ink hover:bg-fern hover:text-lime`}>Facebook</a>
      )}
      {artisan.contact_email && (
        <a href={`mailto:${artisan.contact_email}`} className={`${btn} border border-ink hover:bg-lilac-soft`}>Correo</a>
      )}
    </div>
  );
}
