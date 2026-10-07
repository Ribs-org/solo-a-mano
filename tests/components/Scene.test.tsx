import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Scene from "@/components/home/Scene";
import { HOME_SECTIONS } from "@/lib/homeSections";
import { pickFeatured } from "@/lib/featuredArtisans";
import { installFakeObserver } from "./observer";

const fashion = HOME_SECTIONS.find((s) => s.id === "fashion")!;
const ceramica = HOME_SECTIONS.find((s) => s.id === "ceramica")!;
const noFeatured = pickFeatured([], []);

describe("Scene", () => {
  beforeEach(installFakeObserver);
  afterEach(() => vi.unstubAllGlobals());

  it("el título se lee completo aunque mezcle cursiva y grotesca", () => {
    render(<Scene section={ceramica} featured={noFeatured} />);
    expect(screen.getByRole("heading", { name: "Cerámicas y decoración" })).toBeDefined();
  });

  it("se pega al lado que indica la sección", () => {
    const { container, unmount } = render(<Scene section={fashion} featured={noFeatured} />);
    expect(container.querySelector("section")!.dataset.side).toBe("right");
    unmount();
    const { container: c2 } = render(<Scene section={ceramica} featured={noFeatured} />);
    expect(c2.querySelector("section")!.dataset.side).toBe("left");
  });

  it("cada producto flota con su etiqueta colgante: nombre, precio y sello de ejemplo", () => {
    render(<Scene section={fashion} featured={noFeatured} />);
    for (const p of fashion.examples) {
      const tag = screen.getByRole("img", { name: p.name }).closest("li")!;
      expect(within(tag).getByText(p.name)).toBeDefined();
      expect(within(tag).getByText(`$${p.price_clp.toLocaleString("es-CL")}`)).toBeDefined();
      expect(within(tag).getByText("Ejemplo")).toBeDefined();
    }
  });

  it("los productos bailan desfasados y el botón lleva a Explorar", () => {
    render(<Scene section={ceramica} featured={noFeatured} />);
    const [a, b] = ceramica.examples.map((p) => screen.getByRole("img", { name: p.name }));
    expect(a.className).toContain("animate-sway");
    expect(a.style.animationDelay).not.toBe(b.style.animationDelay);
    expect(screen.getByRole("link", { name: /ver todo/i }).getAttribute("href"))
      .toBe(`/explorar?categoria=${ceramica.category}`);
  });
});

describe("Scene burbujas de artesanos destacados", () => {
  beforeEach(installFakeObserver);
  afterEach(() => vi.unstubAllGlobals());

  const real = { id: "a1", slug: "greda-viva", shop_name: "Greda Viva", comuna: "Pomaire", profile_photo_url: null, main_category: "ceramica" as const };

  it("muestra 3 burbujas en una lista con título para lectores de pantalla", () => {
    render(<Scene section={ceramica} featured={pickFeatured([real], ceramica.exampleArtisans)} />);
    const list = screen.getByRole("list", { name: /talleres destacados/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  it("solo las reales enlazan a la página del artesano; las de respaldo dicen Ejemplo", () => {
    render(<Scene section={ceramica} featured={pickFeatured([real], ceramica.exampleArtisans)} />);
    const list = screen.getByRole("list", { name: /talleres destacados/i });
    expect(within(list).getByRole("link", { name: /greda viva/i }).getAttribute("href")).toBe("/artesano/greda-viva");
    expect(within(list).getAllByRole("link")).toHaveLength(1);
    expect(within(list).getAllByText("Ejemplo")).toHaveLength(2);
  });

  it("sin foto, la burbuja muestra la inicial del taller", () => {
    render(<Scene section={ceramica} featured={pickFeatured([real], ceramica.exampleArtisans)} />);
    const list = screen.getByRole("list", { name: /talleres destacados/i });
    const bubble = within(list).getByRole("link", { name: /greda viva/i });
    expect(within(bubble).getByText("G", { selector: "[data-initial]" })).toBeDefined();
  });
});

describe("HOME_SECTIONS", () => {
  it("cada sección tiene categorías de artesanos y 3 perfiles de respaldo", () => {
    for (const s of HOME_SECTIONS) {
      expect(s.artisanCategories.length).toBeGreaterThan(0);
      expect(s.exampleArtisans).toHaveLength(3);
    }
  });

  it("son tres escenas en zigzag: izquierda, derecha, izquierda", () => {
    expect(HOME_SECTIONS.map((s) => s.title)).toEqual(["Cerámicas y decoración", "Fashion", "Joyería y accesorios"]);
    expect(HOME_SECTIONS.map((s) => s.side)).toEqual(["left", "right", "left"]);
  });

  it("la parte en cursiva y el resto forman el título", () => {
    for (const s of HOME_SECTIONS) expect([s.titleItalic, s.titleRest].join(" ").trim()).toBe(s.title);
  });

  it("cada producto tiene foto en /ejemplos y un lugar dentro de la escena", () => {
    for (const p of HOME_SECTIONS.flatMap((s) => s.examples)) {
      expect(p.image).toMatch(/^\/ejemplos\/.+\.png$/);
      expect(p.spot.x + p.spot.w).toBeLessThanOrEqual(100);
    }
  });
});
