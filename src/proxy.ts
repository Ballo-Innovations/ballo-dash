import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { isApiPath, isPublicPath } from "@/server/public-paths";

/**
 * Deny by default for pages: a visitor needs a valid session cookie (issued by
 * the API) for every page not listed in src/server/public-paths.ts.
 *
 * /api/* is forwarded to the API by a rewrite in next.config.js and the API
 * authorises every request itself, so the proxy lets API paths through.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (isApiPath(pathname) || isPublicPath(pathname)) return NextResponse.next();

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET);
  if (session) return NextResponse.next();

  const login = new URL("/login", request.url);
  const callback = `${pathname}${search}`;
  if (callback.startsWith("/") && !callback.startsWith("//")) login.searchParams.set("callbackUrl", callback);
  return NextResponse.redirect(login);
}

export const config = {
  // Run on everything except static files Next serves itself.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
