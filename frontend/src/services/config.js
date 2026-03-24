import { loadJSON } from "../helpers/loadJSON";

function trimUrl(u) {
  return u ? String(u).replace(/\/$/, "") : "";
}

// CRA inlines REACT_APP_* at build/start time
const envBackendUrl = trimUrl(process.env.REACT_APP_BACKEND_URL);
const envSocketUrl = trimUrl(process.env.REACT_APP_BACKEND_SOCKET_URL);

// If config.json is not found and the hostname is localhost or 127.0.0 load config-dev.json
let config = loadJSON("/config.json");

if (!config && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
  config = loadJSON("/config-dev.json");
  if (!config) {
    config = {
      "BACKEND_PROTOCOL": "http",
      "BACKEND_HOST": "localhost",
      "BACKEND_PORT": "8080",
      "LOG_LEVEL": "debug"
    };
  }
}

if (!config && !envBackendUrl) {
  throw new Error("Config not found");
}

if (!config) {
  config = {};
}

export function getBackendURL() {
  if (envBackendUrl) {
    return envBackendUrl;
  }
  return (
    config.REACT_APP_BACKEND_URL ||
    (config.BACKEND_PROTOCOL ?? "https") + "://" +
    (config.BACKEND_HOST) + ":" + (config.BACKEND_PORT ?? 443) +
    (config.BACKEND_PATH ?? "")
  );
}

export function getBackendSocketURL() {
  if (envSocketUrl) {
    return envSocketUrl;
  }
  if (envBackendUrl) {
    return envBackendUrl;
  }
  return (
    config.REACT_APP_BACKEND_URL ||
    (config.BACKEND_PROTOCOL ?? "https") + "://" +
    (config.BACKEND_HOST) + ":" + (config.BACKEND_PORT ?? 443)
  );
}

export default config;
