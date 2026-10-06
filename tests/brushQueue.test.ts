import { describe, it, expect } from "vitest";
import { createQueue } from "@/lib/brushQueue";

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("createQueue", () => {
  it("ejecuta los trabajos de a uno y en orden", async () => {
    const enqueue = createQueue();
    const log: string[] = [];
    let release!: () => void;

    const first = enqueue(async () => {
      log.push("a:inicio");
      await new Promise<void>((r) => (release = r));
      log.push("a:fin");
      return "a";
    });
    const second = enqueue(async () => {
      log.push("b");
      return "b";
    });

    await tick();
    expect(log).toEqual(["a:inicio"]);
    release();
    expect(await first).toBe("a");
    expect(await second).toBe("b");
    expect(log).toEqual(["a:inicio", "a:fin", "b"]);
  });

  it("un trabajo que falla no bloquea a los siguientes", async () => {
    const enqueue = createQueue();
    const failed = enqueue(async () => { throw new Error("sin webgl"); });
    const next = enqueue(async () => "ok");
    await expect(failed).rejects.toThrow("sin webgl");
    expect(await next).toBe("ok");
  });
});
