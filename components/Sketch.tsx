"use client";

import { useEffect, useRef } from "react";
import { brushQueue } from "@/lib/brushQueue";
import { drawSketch, hasWebGL2 } from "@/lib/drawSketch";
import { SKETCHES, type SketchName } from "@/lib/sketches";

/**
 * Dibujo decorativo hecho con p5.brush. Se traza a mano la primera vez que entra
 * en pantalla y luego queda quieto. Sin WebGL2 queda vacío.
 */
export default function Sketch({ name, className = "" }: { name: SketchName; className?: string }) {
  const def = SKETCHES[name];
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || typeof IntersectionObserver === "undefined" || !hasWebGL2()) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      const animate = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      // Decorativo: si falla, simplemente no aparece.
      brushQueue(() => drawSketch(def, canvas, { animate })).catch(() => {});
    }, { threshold: 0.6 });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [def]);

  return (
    <canvas ref={ref} aria-hidden="true" width={0} height={0} style={{ width: def.width, height: def.height }}
      className={`pointer-events-none block shrink-0 select-none ${className}`} />
  );
}
