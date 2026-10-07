import type { Artisan } from "@/lib/types";
import type { Category } from "@/lib/constants";

/** Columnas de `artisans` que usan las burbujas de la portada. */
export type ArtisanRow = Pick<Artisan, "id" | "slug" | "shop_name" | "comuna" | "profile_photo_url" | "main_category">;
export const FEATURED_COLUMNS = "id, slug, shop_name, comuna, profile_photo_url, main_category";

/** Perfil de respaldo mientras no haya suficientes artesanos verificados en una sección. */
export type ExampleArtisan = { name: string; comuna: string };

export type FeaturedArtisan = {
  key: string;
  name: string;
  comuna: string;
  photo: string | null;
  /** Página del artesano; null en los perfiles de ejemplo. */
  href: string | null;
  example: boolean;
};

export const FEATURED_PER_SECTION = 3;

/** Primero los artesanos reales (en el orden recibido) y se completa con ejemplos hasta `n`. */
export function pickFeatured(real: ArtisanRow[], examples: ExampleArtisan[], n = FEATURED_PER_SECTION): FeaturedArtisan[] {
  const fromDb: FeaturedArtisan[] = real.slice(0, n).map((a) => ({
    key: a.id, name: a.shop_name, comuna: a.comuna, photo: a.profile_photo_url, href: `/artesano/${a.slug}`, example: false,
  }));
  const fill: FeaturedArtisan[] = examples.slice(0, n - fromDb.length).map((e) => ({
    key: `ejemplo-${e.name}`, name: e.name, comuna: e.comuna, photo: null, href: null, example: true,
  }));
  return [...fromDb, ...fill];
}

type SectionRef = { id: string; artisanCategories: readonly Category[]; exampleArtisans: ExampleArtisan[] };

/** Reparte los artesanos (ya ordenados por evaluación) en la sección de su categoría principal. */
export function featuredBySection(rows: ArtisanRow[], sections: SectionRef[]): Record<string, FeaturedArtisan[]> {
  return Object.fromEntries(sections.map((s) => [
    s.id,
    pickFeatured(rows.filter((r) => s.artisanCategories.includes(r.main_category)), s.exampleArtisans),
  ]));
}
