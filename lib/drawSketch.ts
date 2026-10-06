import type { SketchDef } from "@/lib/sketches";
import { whiteToAlpha } from "@/lib/colorToAlpha";

type Brush = typeof import("p5.brush/standalone");

/** Grosor de los pinceles: los de p5.brush vienen pensados para lienzos grandes. */
const BRUSH_SCALE = 3.5;
/** Píxeles de trazo por milisegundo cuando se anima. */
const DRAW_SPEED = 0.35;
const MIN_DURATION = 700;
const MAX_DURATION = 1800;
/** Tamaño del lienzo WebGL compartido: debe caber el sketch más grande. */
const STAGE_W = 300;
const STAGE_H = 120;

let stagePromise: Promise<{ brush: Brush; canvas: HTMLCanvasElement; density: number }> | null = null;

/**
 * Carga p5.brush una sola vez y crea un único lienzo WebGL fuera de la página.
 * Todos los sketches se pintan ahí, de a uno, y se copian a su propio canvas 2D:
 * p5.brush guarda estado de un solo contexto y los navegadores limitan cuántos hay.
 */
function getStage() {
  stagePromise ??= import("p5.brush/standalone").then((brush) => {
    brush.scaleBrushes(BRUSH_SCALE);
    const density = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = brush.createCanvas(STAGE_W, STAGE_H, { pixelDensity: density, parent: null, id: "" });
    return { brush, canvas, density };
  });
  return stagePromise;
}

let webgl2: boolean | undefined;

/** Revisa una sola vez si hay WebGL2 y suelta el contexto de prueba. */
export function hasWebGL2(): boolean {
  if (webgl2 === undefined) {
    try {
      const gl = document.createElement("canvas").getContext("webgl2");
      webgl2 = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl2 = false;
    }
  }
  return webgl2;
}

const segLength = (a: [number, number], b: [number, number]) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const nextFrame = () => new Promise<number>((r) => requestAnimationFrame(r));

/**
 * Dibuja un sketch en `target` (un canvas 2D de la página), animando el trazo si
 * `animate` es true. Debe correr dentro de `brushQueue`, porque el lienzo es compartido.
 */
export async function drawSketch(def: SketchDef, target: HTMLCanvasElement, { animate }: { animate: boolean }): Promise<void> {
  const { brush, canvas, density } = await getStage();
  const w = Math.round(def.width * density), h = Math.round(def.height * density);
  target.width = w;
  target.height = h;
  const ctx = target.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  // Se pinta sobre blanco opaco (p5.brush mezcla los colores asumiendo un fondo así)
  // y luego el blanco se vuelve transparente al copiar.
  brush.clear("#ffffff");
  const copy = () => {
    brush.render();
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    whiteToAlpha(img.data);
    ctx.putImageData(img, 0, 0);
  };

  // p5.brush usa el centro del lienzo como origen; el sketch va en la esquina superior izquierda.
  const ox = STAGE_W / 2, oy = STAGE_H / 2;
  const segments = def.strokes.flatMap((s) =>
    s.points.slice(1).map((p, i) => ({ stroke: s, a: s.points[i], b: p, len: segLength(s.points[i], p) })),
  );
  const drawSegment = ({ stroke, a, b }: (typeof segments)[number]) => {
    brush.set(stroke.brush, stroke.color, stroke.weight);
    brush.line(a[0] - ox, a[1] - oy, b[0] - ox, b[1] - oy);
  };

  if (animate) {
    const total = segments.reduce((sum, s) => sum + s.len, 0);
    const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, total / DRAW_SPEED));
    const start = await nextFrame();
    let drawn = 0, done = 0;
    while (done < segments.length) {
      const elapsed = (await nextFrame()) - start;
      const goal = Math.min(1, elapsed / duration) * total;
      // Solo los tramos nuevos de este cuadro; el lienzo conserva lo anterior.
      while (done < segments.length && (drawn + segments[done].len <= goal || elapsed >= duration)) {
        drawSegment(segments[done]);
        drawn += segments[done].len;
        done++;
      }
      copy();
    }
  } else {
    segments.forEach(drawSegment);
  }

  for (const f of def.fills ?? []) {
    brush.noStroke();
    brush.fill(f.color, f.opacity);
    brush.fillBleed(0.15);
    brush.polygon(f.points.map(([x, y]) => [x - ox, y - oy]));
    brush.noFill();
  }
  copy();
}
