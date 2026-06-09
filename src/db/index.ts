import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL as string;

// Advanced Vercel Build Optimization:
// Agar Next.js build process chal raha hai, toh connection limit ko 1 par set kar do taaki connection drop na ho.
const isBuildPhase = process.env.npm_lifecycle_event === "build";

const client = postgres(connectionString, {
  prepare: false,
  max: isBuildPhase ? 1 : 10, // Build ke time sirf 1 connection use karega
  idle_timeout: 20, // Idle connections ko jaldi close karega
});

export const db = drizzle(client, { schema });
