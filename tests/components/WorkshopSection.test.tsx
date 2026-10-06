import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import WorkshopSection from "@/components/home/WorkshopSection";
import { WORKSHOP_PHOTOS } from "@/lib/workshop";
import { installFakeObserver } from "./observer";

describe("WorkshopSection", () => {
  beforeEach(installFakeObserver);
  afterEach(() => vi.unstubAllGlobals());

  it("muestra el título y una polaroid con su leyenda por foto", () => {
    render(<WorkshopSection />);
    expect(screen.getByRole("heading", { name: /desde el taller/i })).toBeDefined();
    for (const photo of WORKSHOP_PHOTOS) {
      expect(screen.getByRole("img", { name: photo.alt })).toBeDefined();
      expect(screen.getByText(photo.caption)).toBeDefined();
    }
  });
});

describe("WorkshopSection parallax", () => {
  beforeEach(installFakeObserver);
  afterEach(() => vi.unstubAllGlobals());

  it("cada polaroid tiene parallax, y las vecinas van a velocidades distintas", () => {
    const { container } = render(<WorkshopSection />);
    const items = [...container.querySelectorAll("li")];
    expect(items).toHaveLength(WORKSHOP_PHOTOS.length);
    const speeds = items.map((li) => {
      expect(li.classList.contains("parallax")).toBe(true);
      return li.style.getPropertyValue("--speed");
    });
    speeds.slice(1).forEach((s, i) => expect(s).not.toBe(speeds[i]));
  });
});

describe("WORKSHOP_PHOTOS", () => {
  it("son seis fotos de proceso con texto alternativo", () => {
    expect(WORKSHOP_PHOTOS).toHaveLength(6);
    for (const p of WORKSHOP_PHOTOS) expect(p.alt.length).toBeGreaterThan(10);
  });

  // Recordatorio: estas fotos son del moodboard (de terceros) y hay que cambiarlas
  // por fotos propias antes de publicar. Cuando se reemplacen, este test debe actualizarse.
  it("PENDIENTE: fotos del moodboard por reemplazar antes de publicar", () => {
    const pending = WORKSHOP_PHOTOS.filter((p) => p.placeholder);
    if (pending.length) console.warn(`⚠ ${pending.length} fotos placeholder del moodboard en lib/workshop.ts`);
    for (const p of pending) expect(p.src).toMatch(/^\/moodboard-placeholder\//);
  });
});
