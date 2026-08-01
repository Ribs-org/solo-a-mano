import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProductCard from "@/components/ProductCard";

const artisan = { slug: "cuero-sur", shop_name: "Cuero del Sur", verification_status: "verificado" as const };

describe("ProductCard", () => {
  it("muestra nombre, precio formateado y artesano", () => {
    render(<ProductCard product={{ id: "p1", name: "Cartera café", price_clp: 25000, photo_urls: [] }} artisan={artisan} />);
    expect(screen.getByText("Cartera café")).toBeDefined();
    expect(screen.getByText("$25.000")).toBeDefined();
    expect(screen.getByText("Cuero del Sur")).toBeDefined();
  });
  it("precio a convenir cuando es null", () => {
    render(<ProductCard product={{ id: "p2", name: "Queso", price_clp: null, photo_urls: [] }} artisan={artisan} />);
    expect(screen.getByText("Precio a convenir")).toBeDefined();
  });
});
