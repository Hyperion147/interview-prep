import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as leadSchema from "./schema/leads";
import * as visaSchema from "./schema/visas";
import * as packageSchema from "./schema/packages";
import * as followUpSchema from "./schema/follow-ups";
import * as authSchema from "./schema/auth";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

const globalForDb = globalThis as unknown as { leadPool?: Pool };
const pool = globalForDb.leadPool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForDb.leadPool = pool;

export const db = drizzle(pool, { schema: { ...leadSchema, ...visaSchema, ...packageSchema, ...followUpSchema, ...authSchema } });
