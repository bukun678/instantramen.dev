import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8');
}

const smartIcon = read('src/shared/blocks/common/smart-icon.tsx');
const commonBlockBarrel = read('src/shared/blocks/common/index.tsx');
const productionDbEntry = read('src/core/db/index.ts');

for (const forbiddenWholeLibraryImport of [
  "import('react-icons/ri')",
  "import('lucide-react')",
  "import * as",
]) {
  assert(
    !smartIcon.includes(forbiddenWholeLibraryImport),
    `SmartIcon must not load a whole icon library through ${forbiddenWholeLibraryImport}.`
  );
}

for (const requiredBoundary of [
  'const remixIconRegistry',
  'const lucideIconRegistry',
  'RiQuestionLine',
  'HelpCircle',
]) {
  assert(
    smartIcon.includes(requiredBoundary),
    `SmartIcon must preserve an explicit, tree-shakeable boundary for ${requiredBoundary}.`
  );
}

assert(
  !commonBlockBarrel.includes("export * from './mdx-content'"),
  'The common block barrel must not pull the unused runtime MDX compiler into every consumer.'
);
assert(
  existsSync(join(projectRoot, 'src/shared/blocks/common/mdx-content.tsx')),
  'The future MDX component source should be retained even when it is not exported by the production barrel.'
);

for (const inactiveDatabaseProvider of [
  "from './mysql'",
  "from './sqlite'",
  "from './d1'",
]) {
  assert(
    !productionDbEntry.includes(inactiveDatabaseProvider),
    `The Cloudflare production database entry must not bundle the inactive provider ${inactiveDatabaseProvider}.`
  );
}

assert(
  productionDbEntry.includes("from './postgres'"),
  'The Cloudflare production database entry must statically use PostgreSQL.'
);
assert(
  existsSync(join(projectRoot, 'src/core/db/universal.ts')),
  'The multi-provider database implementation should remain in source for future opt-in use.'
);

const disabledTemplateRoutes = [
  'src/app/[locale]/(chat)/layout.tsx',
  'src/app/[locale]/(chat)/chat/page.tsx',
  'src/app/[locale]/(chat)/chat/[id]/page.tsx',
  'src/app/[locale]/(chat)/chat/history/page.tsx',
  'src/app/[locale]/(docs)/layout.tsx',
  'src/app/[locale]/(docs)/docs/[[...slug]]/page.tsx',
  'src/app/api/chat/route.ts',
  'src/app/api/chat/info/route.ts',
  'src/app/api/chat/list/route.ts',
  'src/app/api/chat/messages/route.ts',
  'src/app/api/chat/new/route.ts',
  'src/app/api/docs/search/route.ts',
  'src/app/[locale]/(landing)/(ai)/ai-music-generator/page.tsx',
  'src/app/[locale]/(landing)/(ai)/ai-video-generator/page.tsx',
  'src/app/[locale]/(landing)/blog/page.tsx',
  'src/app/[locale]/(landing)/blog/[slug]/page.tsx',
  'src/app/[locale]/(landing)/blog/category/[slug]/page.tsx',
  'src/app/[locale]/(landing)/showcases/page.tsx',
  'src/app/[locale]/(landing)/updates/page.tsx',
  'src/app/api/ai/generate/route.ts',
  'src/app/api/ai/query/route.ts',
];

for (const routePath of disabledTemplateRoutes) {
  assert(
    !existsSync(join(projectRoot, routePath)),
    `Disabled ShipAny template route must not remain active: ${routePath}.`
  );

  const disabledPath = routePath.replace(/\.(tsx|ts)$/, '.disabled.$1');
  assert(
    existsSync(join(projectRoot, disabledPath)),
    `Disabled route source must remain available at ${disabledPath}.`
  );
}

console.log('Cloudflare Worker bundle boundaries verified.');
