/**
 * Session token check for the web app.
 *
 * The API (ballo-dash-api) signs the session and sets the httpOnly
 * `bd_session` cookie. This file only VERIFIES it, with the same
 * SESSION_SECRET, so the proxy can redirect signed-out visitors before a page
 * renders. Every API call is authorised again by the API itself.
 */
import { jwtVerify } from "jose";

export const SESSION_COOKIE = "bd_session";

export interface SessionClaims {
  userId: string;
  companyId: string;
  role: string;
  email: string;
}

export async function verifySessionToken(token: string | undefined, secret: string | undefined): Promise<SessionClaims | null> {
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: "ballo-dash-api",
      audience: "ballo-dash",
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || typeof payload.cid !== "string") return null;
    return {
      userId: payload.sub,
      companyId: payload.cid,
      role: typeof payload.role === "string" ? payload.role : "READONLY",
      email: typeof payload.email === "string" ? payload.email : "",
    };
  } catch {
    return null;
  }
}
