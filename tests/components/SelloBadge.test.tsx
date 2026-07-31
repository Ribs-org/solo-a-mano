import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SelloBadge from "@/components/SelloBadge";

describe("SelloBadge", () => {
  it("muestra el sello cuando está verificado", () => {
    render(<SelloBadge status="verificado" />);
    expect(screen.getByText("Sello Sólo A Mano")).toBeDefined();
  });
  it("no renderiza nada en otros estados", () => {
    const { container } = render(<SelloBadge status="pendiente" />);
    expect(container.innerHTML).toBe("");
  });
});
