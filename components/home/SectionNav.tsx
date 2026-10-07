"use client";

import { useEffect, useState } from "react";

type NavItem = { id: string; label: string };

/** Barra pegada bajo el menú que salta a cada sección y marca la que está en pantalla. */
export default function SectionNav({ sections }: { sections: NavItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [top, setTop] = useState(0);

  // Se pega justo debajo del header, cuya altura cambia cuando se envuelve en celular.
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setTop(header.offsetHeight));
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // Activa la sección que cruza la mitad de la pantalla.
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Secciones" style={{ top }}
      className="sticky z-30 -mx-4 border-b border-ink/15 bg-bone/90 px-4 py-2 backdrop-blur">
      <ul className="flex gap-2 overflow-x-auto">
        {sections.map((s) => (
          <li key={s.id} className="shrink-0">
            <a href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined}
              className="inline-block rounded-full border border-ink/30 px-4 py-1.5 text-sm hover:bg-lime aria-[current=true]:border-ink aria-[current=true]:bg-lime">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
