/**
 * Starts a throwaway Postgres for local development on port 5433, data
 * kept in ./.data/pg (git-ignored). Leave it running in its own
 * terminal; Ctrl+C stops it.
 *
 *   npm run db:local        # terminal 1
 *   npm run db:push && npm run db:seed && npm run dev   # terminal 2
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";

const dir = "./.data/pg";
const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: "postgres",
  password: "postgres",
  port: 5433,
  persistent: true,
});

async function main() {
  const fresh = !existsSync(dir);
  if (fresh) await pg.initialise();
  await pg.start();
  if (fresh) await pg.createDatabase("mentorship");
  console.log("Local Postgres running: postgresql://postgres:postgres@localhost:5433/mentorship");

  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch(async (e) => {
  console.error(e);
  await pg.stop().catch(() => {});
  process.exit(1);
});
