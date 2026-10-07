/**
 * Fila que ejecuta trabajos asíncronos de a uno. p5.brush dibuja sobre un único
 * canvas activo (estado global), así que dos sketches no pueden pintarse a la vez.
 */
export function createQueue() {
  let tail: Promise<unknown> = Promise.resolve();
  return function enqueue<T>(job: () => Promise<T>): Promise<T> {
    const run = tail.then(job);
    tail = run.catch(() => {}); // un fallo no detiene la fila
    return run;
  };
}

export const brushQueue = createQueue();
