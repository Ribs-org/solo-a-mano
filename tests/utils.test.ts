import { describe, it, expect } from "vitest";
import { formatCLP, slugify, buildWhatsAppLink } from "@/lib/utils";

describe("formatCLP", () => {
  it("formatea miles con punto es-CL", () => expect(formatCLP(12500)).toBe("$12.500"));
  it("null es precio a convenir", () => expect(formatCLP(null)).toBe("Precio a convenir"));
  it("cero se muestra", () => expect(formatCLP(0)).toBe("$0"));
});

describe("slugify", () => {
  it("quita tildes y espacios", () => expect(slugify("Cuero y Greda Ñuñoa")).toBe("cuero-y-greda-nunoa"));
  it("colapsa símbolos", () => expect(slugify("  ¡Quesos!  del  Sur ")).toBe("quesos-del-sur"));
});

describe("buildWhatsAppLink", () => {
  it("arma link wa.me con 56", () =>
    expect(buildWhatsAppLink("9 1234 5678", "Hola, vi tu puesto")).toBe(
      "https://wa.me/56912345678?text=Hola%2C%20vi%20tu%20puesto"
    ));
  it("no duplica el 56", () =>
    expect(buildWhatsAppLink("+56 9 1234 5678", "Hola")).toBe("https://wa.me/56912345678?text=Hola"));
});
