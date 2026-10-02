import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROTECTED_ROUTES, AUTH_ROUTES, ROUTES } from "@/constants/routes";

// ─── Next.js Proxy (route guard) ─────────────────────────────────────────────
// Runs at the edge before any page renders.
// Uses a simple cookie check for fast, stateless route protection.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth cookies: check for active access token OR active refresh token.
  // If access_token has expired but refresh_token exists, the user session is still
  // valid. The client-side Axios interceptor will automatically and silently refresh
  // the access token without redirecting the user away.
  const hasAccessToken =
    request.cookies.has("access_token") ||
    request.cookies.has("taskflow-token") ||
    request.cookies.has("token");

  const hasRefreshToken =
    request.cookies.has("refresh_token") ||
    request.cookies.has("taskflow-refresh-token");

  const isAuthenticated = hasAccessToken || hasRefreshToken;

  // ── Protected route check ────────────────────────────────────────────────
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Auth route check (redirect authenticated users away) ─────────────────
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  return NextResponse.next();
}

// ─── Matcher Config ───────────────────────────────────────────────────────────
// Only run the proxy on relevant routes (excludes _next, static, api)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
