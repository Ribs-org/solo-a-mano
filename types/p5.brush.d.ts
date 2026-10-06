// p5.brush no publica tipos; esto cubre solo la parte de la versión independiente que usamos.
declare module "p5.brush/standalone" {
  export function createCanvas(
    width: number,
    height: number,
    options?: { pixelDensity?: number; parent?: Element | string | null; id?: string },
  ): HTMLCanvasElement;
  export function clear(color?: string): void;
  export function scaleBrushes(factor: number): void;
  export function render(): void;
  export function set(brushName: string, color: string, weight?: number): void;
  export function noStroke(): void;
  export function line(x1: number, y1: number, x2: number, y2: number): void;
  export function fill(color: string, opacity?: number): void;
  export function noFill(): void;
  export function fillBleed(strength: number, direction?: "out" | "in"): void;
  export function polygon(points: [number, number][]): void;
}
