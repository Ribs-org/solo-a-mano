export const CATEGORIES = [
  { value: "carteras_bolsos", label: "Carteras y bolsos" },
  { value: "zapatos_cuero", label: "Zapatos y cuero" },
  { value: "quesos_alimentos", label: "Quesos y alimentos" },
  { value: "ceramica", label: "Cerámica" },
  { value: "tejidos", label: "Tejidos" },
  { value: "joyeria", label: "Joyería" },
  { value: "madera", label: "Madera" },
  { value: "otros", label: "Otros" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? "Otros";
}

export const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
] as const;

export function dayLabel(value: number): string {
  return DAYS.find((d) => d.value === value)?.label ?? "";
}

export const PAGE_SIZE = 24; // productos por página en /explorar
