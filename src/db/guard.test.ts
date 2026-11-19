import { describe, expect, it } from "vitest";
import { assertDestructiveAllowed } from "./guard";

describe("assertDestructiveAllowed", () => {
  it("allows local databases", () => {
    expect(() => assertDestructiveAllowed("postgres://u:p@localhost:5432/dash", {})).not.toThrow();
    expect(() => assertDestructiveAllowed("postgres://u:p@127.0.0.1/dash", {})).not.toThrow();
  });

  it("refuses remote databases unless the exact name is confirmed", () => {
    const remote = "postgres://u:p@db.example.com:5432/ballo_dash_staging";
    expect(() => assertDestructiveAllowed(remote, {})).toThrow(/Refusing destructive operation on remote database/);
    expect(() => assertDestructiveAllowed(remote, { ALLOW_DESTRUCTIVE_DB: "other" })).toThrow();
    expect(() => assertDestructiveAllowed(remote, { ALLOW_DESTRUCTIVE_DB: "ballo_dash_staging" })).not.toThrow();
  });

  it("always refuses in staging and production, even on localhost", () => {
    expect(() => assertDestructiveAllowed("postgres://u:p@localhost/dash", { APP_ENV: "production" })).toThrow(/APP_ENV=production/);
    expect(() => assertDestructiveAllowed("postgres://u:p@localhost/dash", { APP_ENV: "staging" })).toThrow();
  });

  it("rejects missing or malformed URLs", () => {
    expect(() => assertDestructiveAllowed(undefined, {})).toThrow(/not set/);
    expect(() => assertDestructiveAllowed("not a url", {})).toThrow(/not a valid URL/);
  });
});
