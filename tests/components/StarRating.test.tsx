import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import StarRating from "@/components/StarRating";

describe("StarRating", () => {
  it("readonly muestra 5 estrellas con las llenas según value", () => {
    render(<StarRating value={3} />);
    const stars = screen.getAllByTestId(/star-/);
    expect(stars).toHaveLength(5);
    expect(stars.filter((s) => s.dataset.filled === "true")).toHaveLength(3);
  });
  it("interactivo llama onChange con la estrella clickeada", () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("star-4"));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
