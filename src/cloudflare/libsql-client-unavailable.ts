export function createClient(): never {
  throw new Error(
    'Cloudflare Workers deployment only supports PostgreSQL. Set DATABASE_PROVIDER=postgresql.'
  );
}
