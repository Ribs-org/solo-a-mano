import { describe, it, expect } from "vitest";
import { CATEGORIES, categoryLabel, DAYS, dayLabel } from "@/lib/constants";

describe("constants", () => {
  it("hay 8 categorías con la de otros al final", () => {
    expect(CATEGORIES).toHaveLength(8);
    expect(CATEGORIES.at(-1)!.value).toBe("otros");
  });
  it("categoryLabel resuelve y cae a Otros", () => {
    expect(categoryLabel("ceramica")).toBe("Cerámica");
    expect(categoryLabel("inexistente")).toBe("Otros");
  });
  it("días 1-7 lunes a domingo", () => {
    expect(DAYS[0]).toEqual({ value: 1, label: "Lunes" });
    expect(dayLabel(7)).toBe("Domingo");
  });
});
