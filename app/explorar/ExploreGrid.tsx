"use client";
import { useEffect, useRef, useState } from "react";
import { fetchProducts, type ExploreItem } from "@/actions/explore";
import { PAGE_SIZE } from "@/lib/constants";
import MasonryGrid from "@/components/MasonryGrid";
import ProductCard from "@/components/ProductCard";

type Filters = { category?: string; comuna?: string; verifiedOnly?: boolean; q?: string };

export default function ExploreGrid({ initial, filters }: { initial: ExploreItem[]; filters: Filters }) {
  const [items, setItems] = useState(initial);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(initial.length < PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(initial);
    setPage(0);
    setDone(initial.length < PAGE_SIZE);
  }, [initial]);

  useEffect(() => {
    if (done || !sentinel.current) return;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || loading) return;
      setLoading(true);
      const next = await fetchProducts({ ...filters, page: page + 1 });
      setItems((prev) => [...prev, ...next]);
      setPage((p) => p + 1);
      if (next.length < PAGE_SIZE) setDone(true);
      setLoading(false);
    });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [page, done, loading, filters]);

  if (!items.length) return <p className="py-16 text-center text-cafe/60">No encontramos productos con esos filtros.</p>;

  return (
    <>
      <MasonryGrid>
        {items.map((p) => <ProductCard key={p.id} product={p} artisan={p.artisans} />)}
      </MasonryGrid>
      <div ref={sentinel} className="h-8" />
      {loading && <p className="pb-8 text-center text-sm text-cafe/60">Cargando más…</p>}
    </>
  );
}
