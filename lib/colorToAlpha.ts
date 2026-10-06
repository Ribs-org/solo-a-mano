/**
 * Convierte en transparencia el fondo blanco de una imagen RGBA, en el lugar.
 * Cada píxel pasa a ser el color más transparente que, puesto sobre blanco,
 * se ve idéntico (el "color to alpha" de GIMP). Así un trazo pintado sobre
 * blanco se puede poner encima de cualquier fondo.
 */
export function whiteToAlpha(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const a = Math.max(255 - r, 255 - g, 255 - b) / 255;
    if (a === 0) {
      data[i + 3] = 0;
      continue;
    }
    data[i] = 255 - (255 - r) / a;
    data[i + 1] = 255 - (255 - g) / a;
    data[i + 2] = 255 - (255 - b) / a;
    data[i + 3] = Math.round(a * data[i + 3]);
  }
}
