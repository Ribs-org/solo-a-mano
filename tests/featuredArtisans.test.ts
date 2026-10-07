import { describe, it, expect } from "vitest";
import { pickFeatured, featuredBySection, type ArtisanRow } from "@/lib/featuredArtisans";

const row = (n: number, main_category: ArtisanRow["main_category"] = "ceramica"): ArtisanRow => ({
  id: `a${n}`, slug: `taller-${n}`, shop_name: `Taller ${n}`, comuna: "Valdivia",
  profile_photo_url: null, main_category,
});
const examples = [
  { name: "Ejemplo A", comuna: "Pomaire" },
  { name: "Ejemplo B", comuna: "Chillán" },
  { name: "Ejemplo C", comuna: "Quinchamalí" },
];

describe("pickFeatured", () => {
  it("usa primero los artesanos reales, con enlace a su página", () => {
    const [first] = pickFeatured([row(1)], examples);
    expect(first).toMatchObject({ name: "Taller 1", href: "/artesano/taller-1", example: false });
  });

  it("completa con ejemplos hasta llegar a 3, y los ejemplos no llevan enlace", () => {
    const list = pickFeatured([row(1)], examples);
    expect(list.map((a) => a.name)).toEqual(["Taller 1", "Ejemplo A", "Ejemplo B"]);
    expect(list.slice(1).every((a) => a.example && a.href === null)).toBe(true);
  });

  it("nunca muestra más de 3, aunque haya más reales", () => {
    const list = pickFeatured([row(1), row(2), row(3), row(4)], examples);
    expect(list).toHaveLength(3);
    expect(list.every((a) => !a.example)).toBe(true);
  });

  it("sin datos reales muestra solo ejemplos", () => {
    expect(pickFeatured([], examples).every((a) => a.example)).toBe(true);
  });
});

describe("featuredBySection", () => {
  const sections = [
    { id: "ceramica", artisanCategories: ["ceramica", "madera"] as const, exampleArtisans: examples },
    { id: "fashion", artisanCategories: ["tejidos"] as const, exampleArtisans: examples },
  ];

  it("reparte cada artesano en la sección de su categoría, respetando el orden recibido", () => {
    const rows = [row(1, "tejidos"), row(2, "madera"), row(3, "ceramica")];
    const result = featuredBySection(rows, sections);
    expect(result.ceramica.slice(0, 2).map((a) => a.name)).toEqual(["Taller 2", "Taller 3"]);
    expect(result.fashion[0].name).toBe("Taller 1");
    expect(result.fashion[1].example).toBe(true);
  });
});
