import { randomBytes } from "node:crypto";

// Runs in every test worker before any module that reads the environment.
const user = process.env.USER ?? "postgres";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? `postgres://${user}@localhost:5432/ballo_dash_test`;
process.env.TOKEN_ENCRYPTION_KEY ??= randomBytes(32).toString("base64");
process.env.NEXTAUTH_SECRET ??= randomBytes(32).toString("base64");
process.env.APP_ENV = "development";
process.env.LOG_LEVEL ??= "error";
