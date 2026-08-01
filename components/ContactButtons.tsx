import { buildWhatsAppLink } from "@/lib/utils";
import type { Artisan } from "@/lib/types";

type ContactArtisan = Pick<Artisan, "whatsapp_phone" | "instagram_url" | "facebook_url" | "contact_email">;
const btn = "rounded-full px-4 py-1.5 text-sm font-medium";

export default function ContactButtons({ artisan, message }: { artisan: ContactArtisan; message: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {artisan.whatsapp_phone && (
        <a href={buildWhatsAppLink(artisan.whatsapp_phone, message)} target="_blank" rel="noopener noreferrer"
          className={`${btn} bg-verde text-crema hover:opacity-90`}>WhatsApp</a>
      )}
      {artisan.instagram_url && (
        <a href={artisan.instagram_url} target="_blank" rel="noopener noreferrer"
          className={`${btn} bg-terracota text-crema hover:bg-cafe`}>Instagram</a>
      )}
      {artisan.facebook_url && (
        <a href={artisan.facebook_url} target="_blank" rel="noopener noreferrer"
          className={`${btn} bg-terracota text-crema hover:bg-cafe`}>Facebook</a>
      )}
      {artisan.contact_email && (
        <a href={`mailto:${artisan.contact_email}`} className={`${btn} border border-cafe hover:bg-beige`}>Correo</a>
      )}
    </div>
  );
}
