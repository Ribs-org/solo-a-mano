import { render, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { FakeObserver, installFakeObserver } from "./observer";

const drawSketch = vi.fn();
const hasWebGL2 = vi.fn();
vi.mock("@/lib/drawSketch", () => ({ drawSketch, hasWebGL2 }));

const { default: Sketch } = await import("@/components/Sketch");

function setReducedMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: reduce && q.includes("reduce"), media: q }));
}

describe("Sketch", () => {
  beforeEach(() => {
    installFakeObserver();
    drawSketch.mockReset().mockResolvedValue(undefined);
    hasWebGL2.mockReset().mockReturnValue(true);
    setReducedMotion(false);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("es decorativo: los lectores de pantalla lo ignoran", () => {
    const { container } = render(<Sketch name="espiral" />);
    expect(container.querySelector("canvas")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("no dibuja nada sin WebGL2", () => {
    hasWebGL2.mockReturnValue(false);
    render(<Sketch name="espiral" />);
    expect(FakeObserver.instances).toHaveLength(0);
    expect(drawSketch).not.toHaveBeenCalled();
  });

  it("espera a entrar en pantalla y luego dibuja animado en su canvas", async () => {
    const { container } = render(<Sketch name="espiral" />);
    const canvas = container.querySelector("canvas")!;
    expect(drawSketch).not.toHaveBeenCalled();

    act(() => FakeObserver.instances[0].trigger(canvas, true));
    await waitFor(() => expect(drawSketch).toHaveBeenCalled());
    expect(drawSketch).toHaveBeenCalledWith(expect.objectContaining({ width: expect.any(Number) }), canvas,
      { animate: true });
  });

  it("dibuja sin animar si la persona prefiere menos movimiento", async () => {
    setReducedMotion(true);
    const { container } = render(<Sketch name="espiral" />);
    act(() => FakeObserver.instances[0].trigger(container.querySelector("canvas")!, true));
    await waitFor(() => expect(drawSketch).toHaveBeenCalled());
    expect(drawSketch.mock.calls[0][2]).toEqual({ animate: false });
  });
});
