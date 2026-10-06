import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import CategorySection from "@/components/home/CategorySection";
import { HOME_SECTIONS } from "@/lib/homeSections";
import { installFakeObserver } from "./observer";

describe("CategorySection", () => {
  beforeEach(installFakeObserver);
  afterEach(() => vi.unstubAllGlobals());

  it("muestra título, productos de ejemplo y enlace a Explorar", () => {
    const fashion = HOME_SECTIONS.find((s) => s.id === "fashion")!;
    render(<CategorySection section={fashion} number={2} />);
    expect(screen.getByRole("heading", { name: "Fashion" })).toBeDefined();
    expect(screen.getByText("N° 02")).toBeDefined();
    expect(screen.getAllByText("Ejemplo")).toHaveLength(fashion.examples.length);
    expect(screen.getByRole("link", { name: /ver todo/i }).getAttribute("href"))
      .toBe(`/explorar?categoria=${fashion.category}`);
  });
});

describe("CategorySection imágenes", () => {
  beforeEach(installFakeObserver);
  afterEach(() => vi.unstubAllGlobals());

  it("muestra la foto de ejemplo cuando el producto tiene imagen", () => {
    const section = {
      ...HOME_SECTIONS[0],
      examples: [
        { name: "Con foto", price_clp: 1000, image: "/ejemplos/foto.png" },
        { name: "Sin foto", price_clp: 1000 },
      ],
    };
    render(<CategorySection section={section} number={1} />);
    expect(screen.getByRole("img", { name: "Con foto" })).toBeDefined();
    expect(screen.queryByRole("img", { name: "Sin foto" })).toBeNull();
  });

  it("las fotos bailan desfasadas entre sí", () => {
    const section = {
      ...HOME_SECTIONS[0],
      examples: [
        { name: "Uno", price_clp: 1000, image: "/ejemplos/uno.png" },
        { name: "Dos", price_clp: 1000, image: "/ejemplos/dos.png" },
      ],
    };
    render(<CategorySection section={section} number={1} />);
    const [uno, dos] = [screen.getByRole("img", { name: "Uno" }), screen.getByRole("img", { name: "Dos" })];
    expect(uno.className).toContain("animate-sway");
    expect(uno.style.animationDelay).not.toBe(dos.style.animationDelay);
  });
});

describe("HOME_SECTIONS", () => {
  it("cada producto de ejemplo tiene foto en /ejemplos", () => {
    for (const p of HOME_SECTIONS.flatMap((s) => s.examples)) {
      expect(p.image).toMatch(/^\/ejemplos\/.+\.png$/);
    }
  });

  it("tiene las tres secciones en orden", () => {
    expect(HOME_SECTIONS.map((s) => s.title)).toEqual(["Cerámicas y decoración", "Fashion", "Joyería y accesorios"]);
  });
});
