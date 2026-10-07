import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Reveal from "@/components/Reveal";
import { FakeObserver, installFakeObserver } from "./observer";

describe("Reveal", () => {
  beforeEach(installFakeObserver);
  afterEach(() => vi.unstubAllGlobals());

  it("parte oculto y aparece al entrar en pantalla", () => {
    render(<Reveal><p>Hola</p></Reveal>);
    const wrapper = screen.getByText("Hola").parentElement!;
    expect(wrapper.dataset.visible).toBe("false");

    const observer = FakeObserver.instances[0];
    act(() => observer.trigger(wrapper, true));
    expect(wrapper.dataset.visible).toBe("true");
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it("se queda oculto mientras no entra en pantalla", () => {
    render(<Reveal><p>Hola</p></Reveal>);
    const wrapper = screen.getByText("Hola").parentElement!;
    act(() => FakeObserver.instances[0].trigger(wrapper, false));
    expect(wrapper.dataset.visible).toBe("false");
  });

  it("se muestra de inmediato si el navegador no soporta IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Reveal><p>Hola</p></Reveal>);
    expect(screen.getByText("Hola").parentElement!.dataset.visible).toBe("true");
  });
});
