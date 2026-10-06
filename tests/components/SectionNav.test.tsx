import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import SectionNav from "@/components/home/SectionNav";
import { FakeObserver, installFakeObserver } from "./observer";

const sections = [
  { id: "ceramica", label: "Cerámica" },
  { id: "fashion", label: "Fashion" },
];

describe("SectionNav", () => {
  beforeEach(() => {
    installFakeObserver();
    document.body.innerHTML = '<section id="ceramica"></section><section id="fashion"></section>';
  });
  afterEach(() => vi.unstubAllGlobals());

  it("enlaza a cada sección por su id", () => {
    render(<SectionNav sections={sections} />);
    expect(screen.getByRole("link", { name: "Cerámica" }).getAttribute("href")).toBe("#ceramica");
    expect(screen.getByRole("link", { name: "Fashion" }).getAttribute("href")).toBe("#fashion");
  });

  it("marca como actual la sección que está en pantalla", () => {
    render(<SectionNav sections={sections} />);
    const observer = FakeObserver.instances[0];
    act(() => observer.trigger(document.getElementById("fashion")!, true));
    expect(screen.getByRole("link", { name: "Fashion" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("link", { name: "Cerámica" }).getAttribute("aria-current")).toBeNull();
  });
});
