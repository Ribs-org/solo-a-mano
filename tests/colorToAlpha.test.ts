import { describe, it, expect } from "vitest";
import { whiteToAlpha } from "@/lib/colorToAlpha";

const px = (...rgba: number[]) => new Uint8ClampedArray(rgba);

describe("whiteToAlpha", () => {
  it("el blanco queda totalmente transparente", () => {
    const d = px(255, 255, 255, 255);
    whiteToAlpha(d);
    expect(d[3]).toBe(0);
  });

  it("el negro queda opaco y sin cambios", () => {
    const d = px(0, 0, 0, 255);
    whiteToAlpha(d);
    expect([...d]).toEqual([0, 0, 0, 255]);
  });

  it("un color oscuro queda casi opaco", () => {
    const d = px(23, 48, 31, 255); // ink
    whiteToAlpha(d);
    expect(d[3]).toBeGreaterThan(230);
  });

  it("un tono claro se vuelve el color más transparente que sobre blanco se ve igual", () => {
    const d = px(200, 240, 60, 255); // lime
    whiteToAlpha(d);
    const a = d[3] / 255;
    // Al componerlo sobre blanco debe volver al color original (±1 por redondeo).
    const back = [0, 1, 2].map((i) => Math.round(d[i] * a + 255 * (1 - a)));
    back.forEach((v, i) => expect(Math.abs(v - [200, 240, 60][i])).toBeLessThanOrEqual(1));
    expect(a).toBeLessThan(1);
  });

  it("procesa todos los píxeles del arreglo", () => {
    const d = px(255, 255, 255, 255, 0, 0, 0, 255);
    whiteToAlpha(d);
    expect(d[3]).toBe(0);
    expect(d[7]).toBe(255);
  });
});
