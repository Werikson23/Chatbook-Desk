import api from "./api";

let interceptorsInstalled = false;

const parseStoredToken = () => {
  const rawToken = localStorage.getItem("token");
  if (!rawToken) return null;
  try {
    return JSON.parse(rawToken);
  } catch {
    localStorage.removeItem("token");
    return null;
  }
};

/**
 * Registra interceptors uma única vez. Antes, cada uso de useAuth() duplicava
 * headers Authorization e quebrava JWT → 403 em massa no console.
 */
export function ensureApiAuthInterceptors() {
  if (interceptorsInstalled) return;
  interceptorsInstalled = true;

  api.interceptors.request.use(
    (config) => {
      const token = parseStoredToken();
      if (token) {
        const bearer = `Bearer ${token}`;
        config.headers.Authorization = bearer;
        api.defaults.headers.Authorization = bearer;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (!originalRequest) return Promise.reject(error);

      const url = String(originalRequest.url || "");
      if (url.includes("/auth/refresh_token")) {
        return Promise.reject(error);
      }

      const status = error?.response?.status;
      const errCode = error?.response?.data?.error;

      if (
        status === 403 &&
        errCode === "ERR_SESSION_EXPIRED" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          const { data } = await api.post("/auth/refresh_token");
          if (data?.token) {
            localStorage.setItem("token", JSON.stringify(data.token));
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
          }
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem("token");
          localStorage.removeItem("companyId");
          localStorage.removeItem("userId");
          if (window.location.pathname !== "/login") {
            window.location.assign("/login");
          }
          return Promise.reject(refreshErr);
        }
      }

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("companyId");
        localStorage.removeItem("userId");
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }

      return Promise.reject(error);
    }
  );
}
