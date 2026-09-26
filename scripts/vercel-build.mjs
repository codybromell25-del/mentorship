/**
 * Build command Vercel uses (package.json "vercel-build").
 *
 * On production deployments that have a database configured, the Prisma
 * schema is pushed first so new tables and columns appear automatically.
 * `db push` without --accept-data-loss refuses destructive changes, so a
 * risky schema change fails the build instead of deleting data.
 */
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

run("prisma generate");

if (process.env.VERCEL_ENV === "production" && process.env.DATABASE_URL) {
  if (!process.env.DIRECT_URL) {
    console.error("\nDATABASE_URL is set but DIRECT_URL isn't. Add DIRECT_URL (see README, \"Deploy to Vercel\").\n");
    process.exit(1);
  }
  run("prisma db push --skip-generate");
} else if (!process.env.DATABASE_URL) {
  console.log("\nNo DATABASE_URL: building the public site only. Accounts switch on once a database is added.\n");
}

run("next build");
