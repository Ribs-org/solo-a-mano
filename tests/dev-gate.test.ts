import { describe, expect, it } from "vitest";
import { devGate } from "@/lib/dev-gate";

const basic = (user: string, pass: string) => "Basic " + btoa(`${user}:${pass}`);
const preview = { VERCEL_ENV: "preview", DEV_PASSWORD: "secreto" };

describe("devGate", () => {
  it("no bloquea en local ni en producción", () => {
    expect(devGate(null, {})).toBeNull();
    expect(devGate(null, { VERCEL_ENV: "production", DEV_PASSWORD: "secreto" })).toBeNull();
  });

  it("pide contraseña en preview", () => {
    const res = devGate(null, preview);
    expect(res?.status).toBe(401);
    expect(res?.headers.get("WWW-Authenticate")).toContain("Basic");
  });

  it("deja pasar con la contraseña correcta, sin importar el usuario", () => {
    expect(devGate(basic("melani", "secreto"), preview)).toBeNull();
    expect(devGate(basic("", "secreto"), preview)).toBeNull();
  });

  it("rechaza contraseña incorrecta o header inválido", () => {
    expect(devGate(basic("vicente", "otra"), preview)?.status).toBe(401);
    expect(devGate("Basic %%%no-es-base64", preview)?.status).toBe(401);
    expect(devGate("Bearer secreto", preview)?.status).toBe(401);
  });

  it("bloquea todo si falta DEV_PASSWORD en preview", () => {
    expect(devGate(basic("x", ""), { VERCEL_ENV: "preview" })?.status).toBe(503);
  });
});
