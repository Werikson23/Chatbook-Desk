/**
 * Quando o front não é aberto em localhost, public/config*.json com
 * BACKEND_HOST=localhost aponta para o PC do visitante. Trocamos pelo host da página.
 * Cobre IP (192.168.x), nome do PC na rede, .local, etc.
 */
export function isLocalDevHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/** Rede / outro host: qualquer coisa que não seja só localhost. */
export function isRemoteStyleHost(hostname) {
  return Boolean(hostname) && !isLocalDevHost(hostname);
}

export function isPrivateLanHost(hostname) {
  if (isLocalDevHost(hostname)) {
    return false;
  }
  const parts = String(hostname)
    .split(".")
    .map(Number);
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n))) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export function adaptConfigForLanAccess(config) {
  if (!config) return null;
  const h = typeof window !== "undefined" ? window.location.hostname : "";
  if (!h || !isRemoteStyleHost(h)) {
    return config;
  }
  if (config.BACKEND_HOST === "localhost" || config.BACKEND_HOST === "127.0.0.1") {
    return { ...config, BACKEND_HOST: h };
  }
  return config;
}

export function getLanFallbackConfig() {
  const h = typeof window !== "undefined" ? window.location.hostname : "";
  if (!isRemoteStyleHost(h)) {
    return null;
  }
  return {
    BACKEND_PROTOCOL: "http",
    BACKEND_HOST: h,
    BACKEND_PORT: "8080",
    BACKEND_PATH: "",
    LOG_LEVEL: "debug"
  };
}
