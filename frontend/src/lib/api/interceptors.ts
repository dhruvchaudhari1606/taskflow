import {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from "axios";

// Extend Axios request config with custom internal metadata
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }
}

// ─── Refresh Lock & Queue ─────────────────────────────────────────────────────
// Uses a shared singleton Promise. All concurrent 401 requests and any requests
// dispatched while a refresh is in progress await this same Promise.
let refreshPromise: Promise<void> | null = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Check if the request URL belongs to an authentication or public endpoint.
 * These endpoints should NEVER trigger an automatic token refresh on failure.
 */
function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  const excludedEndpoints = [
    "/auth/login",
    "/auth/register",
    "/auth/verify-otp",
    "/auth/resend-otp",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/refresh",
    "/auth/logout",
  ];
  return excludedEndpoints.some((endpoint) => url.includes(endpoint));
}

/**
 * Check if current browser route is an auth page, landing/home page, or public marketing page.
 * Automatic token refresh should not trigger redirects on unauthenticated/public pages.
 */
function isPublicOrAuthPage(): boolean {
  if (typeof window === "undefined") return false;
  const pathname = window.location.pathname;
  if (!pathname || pathname === "/") return true;

  const publicOrAuthRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/features",
    "/pricing",
    "/about",
    "/contact",
  ];

  return publicOrAuthRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Perform silent token refresh against NestJS backend.
 * Guaranteed to run only once at a time via `refreshPromise`.
 */
async function performTokenRefresh(client: AxiosInstance): Promise<void> {
  try {
    // Explicitly pass internal config flag `_skipAuthRefresh: true` so the refresh
    // request itself is never intercepted or looped. Config properties are
    // in-memory only and never sent as HTTP headers over the network (safe from CORS).
    await client.post(
      "/auth/refresh",
      {},
      {
        _skipAuthRefresh: true,
      } as any
    );
  } catch (refreshError: any) {
    const status = refreshError?.response?.status;
    const isAuthFailure = status === 401 || status === 403;

    // Only force logout & redirect if the refresh token is truly expired, invalid, or revoked.
    // Temporary network drops or 5xx server issues should not wipe user credentials.
    if (isAuthFailure && typeof window !== "undefined") {
      try {
        const { useAuthStore } = await import("@/stores/auth-store");
        const { useWorkspaceStore } = await import("@/stores/workspace-store");
        useAuthStore.getState().clearAuth();
        useWorkspaceStore.getState().clearWorkspace();

        const currentPath = window.location.pathname;
        if (!isPublicOrAuthPage()) {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
        }
      } catch {
        // Ignore store import errors during teardown
      }
    }
    throw refreshError;
  }
}

/**
 * Attach request and response interceptors to an Axios instance.
 */
export function setupInterceptors(client: AxiosInstance): AxiosInstance {
  // ─── Request Interceptor ──────────────────────────────────────────────────
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // If a refresh is currently running, pause new API calls until it completes
      // so they are sent with the fresh access token, preventing unnecessary 401s.
      if (refreshPromise && !config._skipAuthRefresh && !isAuthEndpoint(config.url)) {
        try {
          await refreshPromise;
        } catch {
          // Let request proceed or fail naturally if refresh rejected
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ─── Response Interceptor ─────────────────────────────────────────────────
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      // 1. Only handle 401 Unauthorized
      if (error.response?.status !== 401) {
        return Promise.reject(error);
      }

      // 2. Never attempt token refresh for:
      // - requests already retried
      // - requests flagged to skip refresh
      // - auth endpoints (login, register, verify, refresh)
      // - requests made on public or auth pages
      if (
        originalRequest._retry ||
        originalRequest._skipAuthRefresh ||
        isAuthEndpoint(originalRequest.url) ||
        isPublicOrAuthPage()
      ) {
        return Promise.reject(error);
      }

      // Mark as retried to prevent circular retries
      originalRequest._retry = true;

      // 3. Initiate token refresh if not already active
      if (!refreshPromise) {
        refreshPromise = performTokenRefresh(client).finally(() => {
          refreshPromise = null;
        });
      }

      // 4. Queue this request behind the refresh promise and replay automatically upon resolution
      try {
        await refreshPromise;
        return client(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }
  );

  return client;
}
