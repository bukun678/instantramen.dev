import { envConfigs } from '@/config';

import { closePostgresDb, getPostgresDb } from './postgres';

/**
 * Production database entry.
 *
 * Instant Ramen runs on Supabase PostgreSQL. Keeping this entry statically
 * PostgreSQL-only prevents inactive MySQL, SQLite/libSQL, and D1 drivers from
 * being bundled into the Cloudflare Worker. The optional multi-provider
 * implementation remains available in ./universal.ts for a future opt-in
 * deployment.
 */
// Keep the historical `any` return contract: ShipAny model call sites are
// intentionally dialect-agnostic and rely on it to avoid incompatible
// Drizzle overload unions. Only the implementation is PostgreSQL-only here.
export function db(): any {
  if (envConfigs.database_provider !== 'postgresql') {
    throw new Error(
      'This production build supports PostgreSQL only. Set DATABASE_PROVIDER=postgresql.'
    );
  }

  return getPostgresDb();
}

export function dbPostgres(): ReturnType<typeof getPostgresDb> {
  return db() as ReturnType<typeof getPostgresDb>;
}

export async function closeDb() {
  await closePostgresDb();
}
