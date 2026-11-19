/**
 * Standard API route wrapper (H-12).
 *
 * Every route declares, per HTTP method: whether a session is required, which
 * capability it needs, zod schemas for query and body, and an optional rate
 * limit. The handler receives the session's companyId; it must never take a
 * company id from the request.
 *
 * Errors: throw ApiError for anything the client may see. Every other error is
 * logged and returned as a generic 500, so internals never leak.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z, type ZodTypeAny } from "zod";
import { authOptions } from "./auth";
import { ApiError } from "./errors";
import { can, normaliseRole, type Capability, type Role } from "./rbac";
import { checkRateLimit, clientIp, type RateLimitRule } from "./rate-limit";
import { logger } from "@/lib/logger";

const log = logger.child("api");

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  companyId: string;
}

interface RouteOptions<Q extends ZodTypeAny, B extends ZodTypeAny, U> {
  capability?: Capability;
  query?: Q;
  body?: B;
  rateLimit?: RateLimitRule & { by?: "ip" | "user" };
  handler: (ctx: {
    req: NextApiRequest;
    res: NextApiResponse;
    user: U;
    query: z.infer<Q>;
    body: z.infer<B>;
  }) => Promise<unknown> | unknown;
}

interface AnyRoute {
  auth: boolean;
  capability?: Capability;
  query?: ZodTypeAny;
  body?: ZodTypeAny;
  rateLimit?: RateLimitRule & { by?: "ip" | "user" };
  handler: (ctx: never) => unknown;
}

type HandlerFn = (ctx: {
  req: NextApiRequest;
  res: NextApiResponse;
  user: SessionUser | null;
  query: unknown;
  body: unknown;
}) => unknown;

/** A route that requires a signed-in user (the default for every API route). */
export function route<Q extends ZodTypeAny = ZodTypeAny, B extends ZodTypeAny = ZodTypeAny>(
  options: RouteOptions<Q, B, SessionUser>
): AnyRoute {
  return { ...options, auth: true };
}

/** A route anyone may call. Use sparingly and add a rate limit. */
export function publicRoute<Q extends ZodTypeAny = ZodTypeAny, B extends ZodTypeAny = ZodTypeAny>(
  options: RouteOptions<Q, B, SessionUser | null>
): AnyRoute {
  return { ...options, auth: false };
}

export interface ApiDeps {
  getSessionUser: (req: NextApiRequest, res: NextApiResponse) => Promise<SessionUser | null>;
}

export async function getSessionUser(req: NextApiRequest, res: NextApiResponse): Promise<SessionUser | null> {
  const session = await getServerSession(req, res, authOptions);
  const user = session?.user;
  if (!user?.id || !user.companyId || !user.email) return null;
  return { id: user.id, email: user.email, name: user.name ?? "", role: normaliseRole(user.role), companyId: user.companyId };
}

function sendError(res: NextApiResponse, error: ApiError) {
  if (error.headers) for (const [name, value] of Object.entries(error.headers)) res.setHeader(name, value);
  const payload: { code: string; message: string; details?: unknown } = { code: error.code, message: error.message };
  if (error.details !== undefined) payload.details = error.details;
  res.status(error.status).json({ error: payload });
}

function parse<S extends ZodTypeAny>(schema: S | undefined, value: unknown, where: "query" | "body"): z.infer<S> {
  if (!schema) return value as z.infer<S>;
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError(
      "validation_failed",
      `Invalid ${where}`,
      result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
    );
  }
  return result.data;
}

export function apiHandler(
  routes: Partial<Record<HttpMethod, AnyRoute>>,
  deps: ApiDeps = { getSessionUser }
) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    const method = (req.method ?? "GET").toUpperCase() as HttpMethod;
    const config = routes[method];
    try {
      if (!config) {
        res.setHeader("Allow", Object.keys(routes).join(", "));
        throw new ApiError("method_not_allowed", `Method ${method} not allowed`);
      }

      const requiresAuth = config.auth;
      const user = await deps.getSessionUser(req, res);
      if (requiresAuth && !user) throw new ApiError("unauthorized", "Sign in to continue");
      if (config.capability && (!user || !can(user.role, config.capability))) {
        throw new ApiError("forbidden", "You do not have permission to do this");
      }

      if (config.rateLimit) {
        const identity = config.rateLimit.by === "user" && user ? `u:${user.id}` : `ip:${clientIp(req.headers, req.socket?.remoteAddress)}`;
        const result = await checkRateLimit(config.rateLimit, identity);
        if (!result.allowed) {
          throw new ApiError("rate_limited", "Too many requests, try again shortly", undefined, {
            "Retry-After": String(result.retryAfterSeconds),
          });
        }
      }

      const query = parse(config.query, req.query, "query");
      const body = parse(config.body, req.body, "body");
      const result = await (config.handler as unknown as HandlerFn)({ req, res, user, query, body });

      if (res.headersSent || res.writableEnded) return;
      if (result === undefined) {
        res.status(204).end();
        return;
      }
      res.status(method === "POST" ? 201 : 200).json(result);
    } catch (error) {
      if (res.headersSent) {
        log.error("error after response started", { path: req.url, error });
        return;
      }
      if (error instanceof ApiError) {
        sendError(res, error);
        return;
      }
      log.error("unhandled API error", { method, path: req.url?.split("?")[0], error });
      sendError(res, new ApiError("internal", "Something went wrong"));
    }
  };
}
