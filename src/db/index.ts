import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL as string;

// Vercel Build Optimization:
// Build ke time concurrent connections ko limit karna aur timeouts lagana zaroori hai
const isBuildPhase = process.env.npm_lifecycle_event === "build";

const client = postgres(connectionString, {
  prepare: false, // Port 6543 (PgBouncer) ke liye yeh compulsory hai
  max: isBuildPhase ? 1 : 10, // Build ke waqt sirf 1 connection taaki pool exhaust na ho
  idle_timeout: isBuildPhase ? 5 : 20, // Build mein 5 second idle hote hi connection drop kar do
  connect_timeout: 10, // Agar DB connect na ho toh 10 sec mein error de do (60 sec hang nahi hoga)
});

export const db = drizzle(client, { schema });
