import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();

function read(path: string) {
  const absolutePath = join(root, path);
  assert.ok(existsSync(absolutePath), `Missing required file: ${path}`);
  return readFileSync(absolutePath, 'utf8');
}

function listFiles(directory: string): string[] {
  const absoluteDirectory = join(root, directory);

  return readdirSync(absoluteDirectory).flatMap((entry) => {
    const absolutePath = join(absoluteDirectory, entry);
    const relativePath = relative(root, absolutePath);

    return statSync(absolutePath).isDirectory()
      ? listFiles(relativePath)
      : [relativePath];
  });
}

const packageJson = JSON.parse(read('package.json'));
const wrangler = read('wrangler.jsonc');
const openNext = read('open-next.config.ts');
const nextConfig = read('next.config.mjs');
const sourceConfig = read('source.config.ts');
const appConfig = read('src/config/index.ts');
const eslintConfig = read('eslint.config.mjs');
const tsconfig = JSON.parse(read('tsconfig.json'));
const gitignore = read('.gitignore');
const devVarsExample = read('.dev.vars.example');
const modelRoute = read(
  'src/app/[locale]/(landing)/models/[slug]/page.tsx'
);

assert.equal(packageJson.scripts.build, 'next build');
assert.equal(
  packageJson.scripts.preview,
  'opennextjs-cloudflare build && opennextjs-cloudflare preview'
);
assert.equal(
  packageJson.scripts.deploy,
  'opennextjs-cloudflare build && opennextjs-cloudflare deploy'
);
assert.equal(
  packageJson.scripts.upload,
  'opennextjs-cloudflare build && opennextjs-cloudflare upload'
);
assert.equal(
  packageJson.scripts['cf-typegen'],
  'wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts'
);
assert.ok(packageJson.dependencies['@opennextjs/cloudflare']);
assert.ok(packageJson.devDependencies.wrangler);
assert.ok(!packageJson.dependencies['@vercel/analytics']);

assert.match(wrangler, /"name"\s*:\s*"instant-ramen"/);
assert.match(wrangler, /"main"\s*:\s*"\.open-next\/worker\.js"/);
assert.match(wrangler, /"compatibility_date"\s*:\s*"2026-07-13"/);
assert.match(wrangler, /"nodejs_compat"/);
assert.match(wrangler, /"global_fetch_strictly_public"/);
assert.match(
  wrangler,
  /"keep_vars"\s*:\s*true/,
  'Wrangler deploys must preserve dashboard variables and secrets'
);
assert.match(wrangler, /"directory"\s*:\s*"\.open-next\/assets"/);
assert.match(wrangler, /"binding"\s*:\s*"ASSETS"/);
assert.match(wrangler, /"binding"\s*:\s*"WORKER_SELF_REFERENCE"/);
assert.match(
  wrangler,
  /"@libsql\/client"\s*:\s*"\.\/src\/cloudflare\/libsql-client-unavailable\.ts"/
);
assert.doesNotMatch(wrangler, /\b(?:r2_buckets|d1_databases|hyperdrive)\b/i);
assert.doesNotMatch(wrangler, /instantramen\.dev/i);

assert.match(openNext, /defineCloudflareConfig/);
assert.doesNotMatch(openNext, /r2IncrementalCache|R2IncrementalCache/);

assert.match(
  appConfig,
  /from ['"]@\/domains\/instant-ramen\/config\/brand['"]/,
  'Database tooling must import brand config directly without loading UI barrels'
);
assert.doesNotMatch(appConfig, /from ['"]@\/domains\/instant-ramen['"]/);

assert.match(
  nextConfig,
  /serverExternalPackages\s*:\s*\[[\s\S]*?['"]postgres['"]/
);
assert.match(
  nextConfig,
  /transpilePackages\s*:\s*isPostgresBuild\s*\?\s*\[['"]@libsql\/client['"]\]\s*:\s*\[\]/,
  'PostgreSQL Cloudflare builds must transpile @libsql/client so the build-only stub can replace it'
);
assert.match(sourceConfig, /langs\s*:\s*\[['"]bash['"]\]/);
assert.match(sourceConfig, /experimentalJSEngine\s*:\s*true/);
assert.ok(tsconfig.exclude?.includes('cloudflare-env.d.ts'));
assert.match(
  eslintConfig,
  /['"]\.wrangler\/\*\*['"]/,
  'ESLint must ignore Wrangler-generated Worker bundles'
);
assert.match(
  modelRoute,
  /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/,
  'Dynamic model pages must render on request when no incremental cache binding is configured'
);
assert.doesNotMatch(
  modelRoute,
  /export\s+const\s+revalidate\s*=/,
  'Dynamic model pages must not depend on unavailable ISR storage'
);

for (const ignoredPath of [
  '.env',
  '.env.local',
  '.env.production',
  '.dev.vars',
  '.open-next',
  '.wrangler',
  'cloudflare-env.d.ts',
]) {
  assert.ok(
    gitignore.includes(ignoredPath),
    `${ignoredPath} must be ignored by Git`
  );
}
assert.ok(gitignore.includes('!.dev.vars.example'));

for (const key of [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'APIMART_API_KEY',
  'DATABASE_PROVIDER',
  'DATABASE_URL',
  'DB_SCHEMA_FILE',
  'DB_MIGRATIONS_OUT',
  'DB_SINGLETON_ENABLED',
  'DB_MAX_CONNECTIONS',
  'AUTH_SECRET',
]) {
  assert.match(devVarsExample, new RegExp(`^${key}=`, 'm'));
}
assert.match(devVarsExample, /pooler\.supabase\.com/);
assert.doesNotMatch(devVarsExample, /@db\.[^/]*supabase\.co/i);
assert.doesNotMatch(devVarsExample, /sb_secret_/i);

assert.ok(!existsSync(join(root, 'package-lock.json')));
assert.ok(!existsSync(join(root, 'src/extensions/analytics/vercel-analytics.tsx')));
assert.ok(existsSync(join(root, 'src/middleware.ts')));
assert.ok(!existsSync(join(root, 'src/proxy.ts')));
assert.match(read('src/middleware.ts'), /export\s+async\s+function\s+middleware/);
assert.match(
  read('src/cloudflare/libsql-client-unavailable.ts'),
  /Cloudflare Workers deployment only supports PostgreSQL/
);

const edgeRuntimeDeclarations = listFiles('src')
  .filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path))
  .filter((path) =>
    /export\s+const\s+runtime\s*=\s*['"]edge['"]/.test(read(path))
  );
assert.deepEqual(
  edgeRuntimeDeclarations,
  [],
  `Edge runtime declarations remain: ${edgeRuntimeDeclarations.join(', ')}`
);

console.log('Cloudflare Workers migration contract verified.');
