import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE_S,
  buildAttribution,
  serializeAttribution,
} from "./lib/attribution/attribution";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return await updateSession(request);
  }
  return captureFirstTouch(request);
}

/**
 * Stores where the visitor first came from, in a first-party cookie read only by the
 * server. First touch wins: an existing cookie is never overwritten. No redirect, and the
 * query string is left as it is.
 */
function captureFirstTouch(request: NextRequest) {
  const response = NextResponse.next();
  if (request.cookies.has(ATTRIBUTION_COOKIE)) return response;

  const attribution = buildAttribution({
    searchParams: request.nextUrl.searchParams,
    pathname: request.nextUrl.pathname,
    referer: request.headers.get("referer"),
    host: request.headers.get("host") ?? request.nextUrl.host,
  });
  if (!attribution) return response;

  response.cookies.set(ATTRIBUTION_COOKIE, serializeAttribution(attribution), {
    maxAge: ATTRIBUTION_MAX_AGE_S,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    // Public pages, only for landing requests that carry utm_source and have no src cookie
    // yet. Excludes api, admin, Next internals and any path with a file extension
    // (static files, images, sitemap.xml, robots.txt).
    {
      source: "/((?!api|admin|_next|.*\\..*).*)",
      has: [{ type: "query", key: "utm_source" }],
      missing: [{ type: "cookie", key: "src" }],
    },
  ],
};
