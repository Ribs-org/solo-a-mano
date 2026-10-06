type GateEnv = { VERCEL_ENV?: string; DEV_PASSWORD?: string };

/**
 * Contraseña del equipo para todo lo que no es producción (rama dev y previews de Vercel).
 * Devuelve la respuesta de bloqueo, o null si la request puede seguir.
 * En local (sin VERCEL_ENV) y en producción no hace nada.
 */
export function devGate(authorization: string | null, env: GateEnv): Response | null {
  if (env.VERCEL_ENV !== "preview") return null;
  // Si falta la variable se bloquea todo: mejor un dev caído que un dev público.
  if (!env.DEV_PASSWORD) {
    return new Response("Falta configurar DEV_PASSWORD en Vercel (Preview).", { status: 503 });
  }
  if (authorization?.startsWith("Basic ")) {
    try {
      const decoded = atob(authorization.slice(6));
      if (decoded.slice(decoded.indexOf(":") + 1) === env.DEV_PASSWORD) return null;
    } catch {
      // base64 inválido: se trata como contraseña incorrecta
    }
  }
  return new Response("Ambiente de desarrollo de Sólo A Mano: necesitas la contraseña del equipo.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Solo a Mano (dev)", charset="UTF-8"' },
  });
}
