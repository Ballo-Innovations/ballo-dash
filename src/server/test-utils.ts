/** Minimal NextApiRequest/NextApiResponse doubles for unit-testing API handlers. */
import type { NextApiRequest, NextApiResponse } from "next";
import type { SessionUser } from "./api";

export interface MockResponse {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
  ended: boolean;
}

export function mockReqRes(init: {
  method?: string;
  query?: Record<string, string | string[]>;
  body?: unknown;
  headers?: Record<string, string>;
  url?: string;
}): { req: NextApiRequest; res: NextApiResponse; out: MockResponse } {
  const out: MockResponse = { statusCode: 200, body: undefined, headers: {}, ended: false };
  const req = {
    method: init.method ?? "GET",
    query: init.query ?? {},
    body: init.body,
    headers: init.headers ?? {},
    url: init.url ?? "/api/test",
    socket: { remoteAddress: "127.0.0.1" },
  } as unknown as NextApiRequest;
  const res = {
    get headersSent() {
      return out.ended;
    },
    get writableEnded() {
      return out.ended;
    },
    status(code: number) {
      out.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      out.body = payload;
      out.ended = true;
      return res;
    },
    send(payload: unknown) {
      out.body = payload;
      out.ended = true;
      return res;
    },
    end() {
      out.ended = true;
      return res;
    },
    setHeader(name: string, value: string) {
      out.headers[name.toLowerCase()] = String(value);
      return res;
    },
    redirect(code: number, url: string) {
      out.statusCode = code;
      out.headers.location = url;
      out.ended = true;
      return res;
    },
  } as unknown as NextApiResponse;
  return { req, res, out };
}

export const testUser = (overrides: Partial<SessionUser> = {}): SessionUser => ({
  id: "00000000-0000-4000-8000-000000000001",
  email: "admin@example.test",
  name: "Test Admin",
  role: "ADMIN",
  companyId: "00000000-0000-4000-8000-0000000000c1",
  ...overrides,
});
