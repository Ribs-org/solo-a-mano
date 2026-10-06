// Dibujos a mano alzada que p5.brush traza sobre la portada.
// Coordenadas en píxeles desde la esquina superior izquierda de cada sketch.

type Point = [number, number];

export type SketchStroke = {
  /** Pincel de p5.brush: "2B", "HB", "pen", "crayon", "marker", "charcoal"… */
  brush: string;
  color: string;
  weight: number;
  points: Point[];
};

export type SketchFill = { color: string; opacity: number; points: Point[] };

export type SketchDef = {
  width: number;
  height: number;
  strokes: SketchStroke[];
  /** Manchas de acuarela que se pintan al final, cuando el trazo ya está completo. */
  fills?: SketchFill[];
};

// Mismos valores que los tokens de app/globals.css (el canvas no lee variables CSS).
const C = {
  ink: "#111111",
  lilac: "#a98be8",
  lime: "#d4ff3a",
  bubblegum: "#ff8fc7",
};

// ---------- Generadores de formas ----------

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Puntos de una elipse; `from`/`to` en vueltas (0..1) para dibujar solo un arco. */
function ellipse(cx: number, cy: number, rx: number, ry: number, from = 0, to = 1, steps = 40): Point[] {
  return range(steps + 1).map((i) => {
    const a = 2 * Math.PI * (from + ((to - from) * i) / steps);
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });
}

function star(cx: number, cy: number, outer: number, inner: number): Point[] {
  const pts = range(10).map((i): Point => {
    const r = i % 2 ? inner : outer;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  return [...pts, pts[0]];
}

function spiral(cx: number, cy: number, turns: number, maxR: number, steps = 90): Point[] {
  return range(steps + 1).map((i) => {
    const t = i / steps;
    const a = t * turns * 2 * Math.PI;
    return [cx + maxR * t * Math.cos(a), cy + maxR * t * Math.sin(a)];
  });
}

/** Línea ondulada horizontal o con pendiente, como un trazo hecho a pulso. */
function wave(x1: number, y1: number, x2: number, y2: number, amp: number, waves: number, steps = 40): Point[] {
  return range(steps + 1).map((i) => {
    const t = i / steps;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const off = amp * Math.sin(t * waves * 2 * Math.PI);
    return [x1 + dx * t - (dy / len) * off, y1 + dy * t + (dx / len) * off];
  });
}

/** Curva Bézier cuadrática. */
function curve(p0: Point, c: Point, p1: Point, steps = 30): Point[] {
  return range(steps + 1).map((i) => {
    const t = i / steps, u = 1 - t;
    return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
  });
}

// ---------- Dibujos ----------

const cupBody: Point[] = [[22, 40], ...curve([24, 44], [26, 104], [55, 104]), ...curve([55, 104], [84, 104], [86, 44]), [88, 40]];

export const SKETCHES = {
  estrella: {
    width: 48, height: 48,
    strokes: [{ brush: "pen", color: C.ink, weight: 1, points: star(24, 25, 20, 9) }],
    fills: [{ color: C.lime, opacity: 140, points: star(24, 25, 18, 8) }],
  },
  subrayado: {
    width: 280, height: 28,
    strokes: [
      { brush: "marker", color: C.lime, weight: 1.6, points: wave(10, 15, 270, 13, 2, 1.5) },
      { brush: "pen", color: C.ink, weight: 0.8, points: wave(30, 20, 250, 17, 2.5, 2) },
    ],
  },
  taza: {
    width: 120, height: 112,
    strokes: [
      { brush: "pen", color: C.ink, weight: 1, points: ellipse(55, 40, 33, 7) },
      { brush: "pen", color: C.ink, weight: 1, points: cupBody },
      { brush: "pen", color: C.ink, weight: 1, points: curve([86, 54], [116, 62], [83, 86]) },
      { brush: "pen", color: C.ink, weight: 0.8, points: wave(44, 28, 40, 4, 3, 1) },
      { brush: "pen", color: C.ink, weight: 0.8, points: wave(62, 28, 66, 6, 3, 1) },
    ],
    fills: [{ color: C.lilac, opacity: 150, points: [...ellipse(55, 40, 33, 7, 0, 0.5, 20), ...cupBody.slice(1, -1).reverse()] }],
  },
  aguja: {
    width: 132, height: 112,
    strokes: [
      { brush: "pen", color: C.ink, weight: 1.2, points: [[18, 100], [96, 16]] },
      { brush: "pen", color: C.ink, weight: 0.8, points: ellipse(92, 21, 3.5, 6, 0, 1, 16) },
      {
        brush: "2B", color: C.lime, weight: 1.4,
        points: [...curve([92, 21], [124, 30], [112, 62]), ...curve([112, 62], [96, 100], [58, 92]),
          ...curve([58, 92], [28, 84], [48, 62]), ...curve([48, 62], [64, 46], [76, 70])],
      },
    ],
  },
  anillo: {
    width: 112, height: 112,
    strokes: [
      { brush: "pen", color: C.ink, weight: 1, points: ellipse(56, 70, 32, 30, 0.8, 1.7) },
      { brush: "pen", color: C.ink, weight: 1, points: [[56, 16], [72, 32], [56, 46], [40, 32], [56, 16]] },
      { brush: "pen", color: C.ink, weight: 0.7, points: [[80, 16], [89, 8]] },
      { brush: "pen", color: C.ink, weight: 0.7, points: [[84, 30], [96, 30]] },
      { brush: "pen", color: C.ink, weight: 0.7, points: [[32, 16], [23, 8]] },
    ],
    fills: [{ color: C.bubblegum, opacity: 160, points: [[56, 18], [70, 32], [56, 44], [42, 32]] }],
  },
  espiral: {
    width: 90, height: 90,
    strokes: [{ brush: "pen", color: C.ink, weight: 1.4, points: spiral(45, 45, 3, 38) }],
  },
  flecha: {
    width: 150, height: 84,
    strokes: [
      { brush: "pen", color: C.ink, weight: 1.4, points: curve([10, 70], [60, 0], [132, 34]) },
      { brush: "pen", color: C.ink, weight: 1.4, points: [[116, 22], [132, 34], [114, 44]] },
    ],
  },
} satisfies Record<string, SketchDef>;

export type SketchName = keyof typeof SKETCHES;
