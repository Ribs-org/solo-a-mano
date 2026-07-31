export function formatCLP(price: number | null): string {
  if (price == null) return "Precio a convenir";
  return "$" + new Intl.NumberFormat("es-CL").format(price);
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("56") ? digits : "56" + digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`;
}
