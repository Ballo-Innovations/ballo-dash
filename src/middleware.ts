import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isApiPath, isPublicPath } from "@/server/public-paths";

/**
 * Deny by default (H-01): every page and API route needs a session unless it
 * is listed in src/server/public-paths.ts. Pages redirect to /login with a
 * callback; API routes answer 401 JSON. API handlers still check the session
 * themselves (src/server/api.ts); this is the outer fence.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token) return NextResponse.next();

  if (isApiPath(pathname)) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Sign in to continue" } }, { status: 401 });
  }

  const login = new URL("/login", request.url);
  const callback = `${pathname}${search}`;
  // Only same-site relative callbacks, never an absolute URL.
  if (callback.startsWith("/") && !callback.startsWith("//")) login.searchParams.set("callbackUrl", callback);
  return NextResponse.redirect(login);
}

export const config = {
  // Run on everything except static files Next serves itself.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
