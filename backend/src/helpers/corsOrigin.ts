/**
 * CORS / Socket.IO — origens permitidas.
 * Em dev na LAN, FRONTEND_URL_REGEX costuma liberar a porta do front (ex.: :2303); trim evita falha silenciosa.
 */

function trimEnv(value: string | undefined): string {
  return (value ?? "").trim();
}

function buildAllowedOriginsList(): string[] {
  const list: string[] = [];
  const primary = trimEnv(process.env.FRONTEND_URL);
  if (primary) {
    list.push(primary);
  }
  const custom = trimEnv(process.env.FRONTEND_CUSTOM_URL);
  if (custom) {
    custom.split(",").forEach(u => {
      const t = u.trim();
      if (t) list.push(t);
    });
  }
  return list;
}

function compileFrontendRegex(): RegExp | null {
  const raw = trimEnv(process.env.FRONTEND_URL_REGEX);
  if (!raw) return null;
  try {
    return new RegExp(raw);
  } catch {
    return null;
  }
}

/**
 * Callback compatível com `cors` (Express) e Socket.IO `cors.origin`.
 */
export function dynamicCorsOriginCallback(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
): void {
  const allowedOrigins = buildAllowedOriginsList();
  const regex = compileFrontendRegex();

  if (!origin) {
    callback(null, true);
    return;
  }
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }
  if (regex && regex.test(origin)) {
    callback(null, true);
    return;
  }
  callback(new Error(`Origin ${origin} is not allowed by CORS`));
}

const useDynamic =
  Boolean(trimEnv(process.env.FRONTEND_CUSTOM_URL)) ||
  Boolean(trimEnv(process.env.FRONTEND_URL_REGEX));

export const corsOrigin = useDynamic
  ? dynamicCorsOriginCallback
  : trimEnv(process.env.FRONTEND_URL) || true;
