import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Thread from "@/components/home/Thread";

describe("Thread", () => {
  it("es decorativo y su trazo se dibuja con el scroll", () => {
    const { container } = render(<Thread />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    const path = svg.querySelector("path")!;
    expect(path.getAttribute("class")).toContain("thread-path");
    // pathLength=1 permite animar el trazo de 0 a 1 sin medir el largo real del camino.
    expect(path.getAttribute("pathLength")).toBe("1");
  });
});
