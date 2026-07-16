import { existsSync, readFileSync } from 'node:fs';

import {
  buildInstantRamenWebApplicationSchema,
  getInstantRamenGeneratorEntryModels,
  getInstantRamenModelBySlug,
  instantRamenArtwork,
  instantRamenSitemapRoutes,
} from '../src/domains/instant-ramen';
import {
  instantRamenTextToImageMvpModels,
  resolveInstantRamenGeneratorModel,
} from '../src/domains/instant-ramen/product/text-to-image';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const coreSlugs = ['gpt-image-2', 'nano-banana', 'instant-ramen'] as const;
const generatorModels = getInstantRamenGeneratorEntryModels();

assert(
  instantRamenArtwork.hero.length >= 3 &&
    instantRamenArtwork.gallery.length >= 8,
  'The homepage must use at least three original hero candidates and eight original gallery images.'
);

assert(
  generatorModels.map((model) => model.slug).join(',') === coreSlugs.join(','),
  'Generator models must follow the shared GPT Image 2, Nano Banana 2, Instant Ramen order.'
);

for (const [index, slug] of coreSlugs.entries()) {
  const model = getInstantRamenModelBySlug(slug);
  assert(model, `Missing core model ${slug}.`);
  assert(
    model.sortOrder === index + 1,
    `${slug} must define the shared sortOrder.`
  );
  assert('featured' in model, `${slug} must define featured.`);
  assert('recommended' in model, `${slug} must define recommended.`);
  assert('defaultSelected' in model, `${slug} must define defaultSelected.`);
  assert('indexable' in model, `${slug} must define indexable.`);
  assert(
    model.howTo.length === 3,
    `${slug} must define a three-step model-specific workflow.`
  );
  assert(
    Boolean(model.difference),
    `${slug} must explain how it differs from the other available models.`
  );
}

const coreModelCopy = JSON.stringify(
  coreSlugs.map((slug) => getInstantRamenModelBySlug(slug))
).toLowerCase();
assert(
  !coreModelCopy.includes('provider execution comes later') &&
    !coreModelCopy.includes('provider is not connected'),
  'Published model pages must not expose obsolete provider-development copy.'
);

assert(
  getInstantRamenModelBySlug('gpt-image-2')?.defaultSelected === true,
  'GPT Image 2 must be the current default model.'
);
assert(
  getInstantRamenModelBySlug('nano-banana')?.displayName === 'Nano Banana 2',
  'The user-facing model name must remain Nano Banana 2.'
);
assert(
  getInstantRamenModelBySlug('instant-ramen')?.allowGeneration === false,
  'Instant Ramen must remain a non-generating Coming Soon entry.'
);

assert(
  resolveInstantRamenGeneratorModel('nano-banana') === 'nano-banana',
  'A valid URL model parameter must select Nano Banana 2.'
);
for (const invalidModel of ['instant-ramen', 'flux', 'missing-model', null]) {
  assert(
    resolveInstantRamenGeneratorModel(invalidModel) === 'gpt-image-2',
    `Invalid or unavailable model parameter ${invalidModel} must fall back to GPT Image 2.`
  );
}
assert(
  instantRamenTextToImageMvpModels[0]?.slug === 'gpt-image-2',
  'Generation model order must be data-driven and start with GPT Image 2.'
);

const sitemapModelPaths = instantRamenSitemapRoutes
  .filter((route) => route.key.startsWith('model:'))
  .map((route) => route.path);
assert(
  sitemapModelPaths.join(',') ===
    coreSlugs.map((slug) => `/models/${slug}`).join(','),
  'Sitemap must include only the three indexable MVP model pages in shared order.'
);
assert(
  !existsSync('public/sitemap.xml'),
  'The stale static public/sitemap.xml must not override the dynamic sitemap route.'
);

const modelRoute = readFileSync(
  'src/app/[locale]/(landing)/models/[slug]/page.tsx',
  'utf8'
);
assert(
  modelRoute.includes('await buildInstantRamenMetadata'),
  'Model routes must resolve concrete page metadata instead of returning a metadata factory.'
);

const modelTemplate = readFileSync(
  'src/domains/instant-ramen/components/model-page-template.tsx',
  'utf8'
);
for (const schemaBuilder of [
  'buildInstantRamenBreadcrumbSchema',
  'buildInstantRamenFaqSchema',
]) {
  assert(
    modelTemplate.includes(schemaBuilder),
    `Model pages must render visible structured data through ${schemaBuilder}.`
  );
}
assert(
  modelTemplate.includes('aria-label="Breadcrumb"'),
  'Model pages must render an accessible visible breadcrumb.'
);
assert(
  modelTemplate.includes("from 'next/image'") &&
    modelTemplate.includes('getInstantRamenModelArtwork') &&
    modelTemplate.includes('model.howTo') &&
    modelTemplate.includes('model.difference') &&
    modelTemplate.includes('visibleInstantRamenModels'),
  'Model pages must use optimized artwork, unique workflow and comparison copy, and data-driven related models.'
);
assert(
  modelTemplate.includes('<details') &&
    !modelTemplate.includes('provider execution') &&
    !modelTemplate.includes('product roadmap slot'),
  'Model FAQ must be visible and obsolete development copy must be removed.'
);
assert(
  modelTemplate.includes('text-neutral-300') &&
    modelTemplate.includes('bg-white text-neutral-950'),
  'The Coming Soon alternative CTA must remain readable on the dark closing section.'
);

const homeTemplate = readFileSync(
  'src/domains/instant-ramen/components/home-landing-page.tsx',
  'utf8'
);
assert(
  homeTemplate.includes("from 'next/image'") &&
    homeTemplate.includes('instantRamenArtwork') &&
    homeTemplate.includes('id="generator"'),
  'Homepage must use optimized original artwork and place the generator immediately after the hero.'
);
assert(
  homeTemplate.includes('fetchPriority="high"'),
  'The single homepage LCP artwork must advertise a high fetch priority.'
);
assert(
  !homeTemplate.includes('bg-[radial-gradient') &&
    !homeTemplate.includes('linear-gradient'),
  'Homepage must not use CSS gradient artwork placeholders.'
);

const generatorTemplate = readFileSync(
  'src/domains/instant-ramen/components/text-to-image-mvp.tsx',
  'utf8'
);
assert(
  generatorTemplate.includes('useSearchParams') &&
    generatorTemplate.includes('resolveInstantRamenGeneratorModel'),
  'The shared generator must read and safely resolve the model URL parameter.'
);
assert(
  generatorTemplate.includes('aria-live="polite"'),
  'Generator status updates must be announced accessibly.'
);
assert(
  generatorTemplate.includes('data-model-slug={option.slug}') &&
    !generatorTemplate.includes('aria-label={'),
  'Model choices must expose their complete visible name and status to assistive technology.'
);

const seoToolTemplate = readFileSync(
  'src/domains/instant-ramen/components/seo-tool-page.tsx',
  'utf8'
);
assert(
  seoToolTemplate.includes("routeKey === 'aiImageGenerator'") &&
    seoToolTemplate.includes('id="generator"') &&
    seoToolTemplate.includes('InstantRamenTextToImageMvp'),
  'The standalone generator page must keep the real generator as its primary tool.'
);

const layoutConfig = readFileSync(
  'src/domains/instant-ramen/config/layout.ts',
  'utf8'
);
assert(
  layoutConfig.includes("className: 'instant-ramen-header'") &&
    layoutConfig.includes("className: 'instant-ramen-footer'"),
  'The landing header and footer must opt into the shared Instant Ramen theme surface.'
);

const landingLayout = readFileSync(
  'src/themes/default/layouts/landing.tsx',
  'utf8'
);
assert(
  landingLayout.includes('min-h-screen w-full') &&
    !landingLayout.includes('h-screen w-screen'),
  'Landing pages must not use viewport width, which creates horizontal overflow beside the scrollbar.'
);

const globalStyles = readFileSync('src/config/style/global.css', 'utf8');
assert(
  globalStyles.includes('.instant-ramen-surface') &&
    globalStyles.includes('.dark .instant-ramen-surface') &&
    globalStyles.includes('--primary:'),
  'Instant Ramen pages must define scoped warm-light and charcoal-dark theme tokens.'
);
assert(
  globalStyles.includes('--primary: #b64900') &&
    globalStyles.includes('.instant-ramen-footer a'),
  'The light theme must use a contrast-safe orange and distinguish footer links without color alone.'
);

const localeLayout = readFileSync('src/app/[locale]/layout.tsx', 'utf8');
assert(
  localeLayout.includes('instantRamenBrandConfig.appUrl'),
  'Public hreflang links must use the canonical Instant Ramen brand origin.'
);

const themeProvider = readFileSync('src/core/theme/provider.tsx', 'utf8');
assert(
  themeProvider.includes('globalThis.__name') &&
    themeProvider.indexOf('globalThis.__name') <
      themeProvider.indexOf('<NextThemesProvider'),
  'Cloudflare must define the function-name helper before the next-themes no-flash script runs.'
);

const commonMessages = readFileSync(
  'src/config/locale/messages/en/common.json',
  'utf8'
);
const landingMessages = readFileSync(
  'src/config/locale/messages/en/landing.json',
  'utf8'
);
assert(
  !commonMessages.includes('ShipAny') &&
    !landingMessages.includes('ShipAny') &&
    !landingMessages.includes('your-domain.com'),
  'Serialized landing messages must not expose ShipAny or placeholder-domain metadata.'
);

const authModal = readFileSync(
  'src/domains/instant-ramen/auth/auth-modal.tsx',
  'utf8'
);
assert(
  !authModal.includes('bg-[radial-gradient') &&
    !authModal.includes('from-[#b22dea]'),
  'The existing auth modal must retain its behavior while removing legacy gradient styling.'
);

const webApplicationSchema = buildInstantRamenWebApplicationSchema();
assert(
  !('offers' in webApplicationSchema),
  'WebApplication schema must not publish an unverified free offer.'
);

const brandConfig = readFileSync(
  'src/domains/instant-ramen/config/brand.ts',
  'utf8'
);
assert(
  !brandConfig.includes('generation and editing') &&
    !brandConfig.includes('Create and edit images'),
  'Brand metadata must describe the currently available text-to-image product without promising editing.'
);

const robotsRoute = readFileSync('src/app/robots.ts', 'utf8');
for (const privateRoute of ['/auth/*', '/create/history']) {
  assert(
    robotsRoute.includes(`'${privateRoute}'`),
    `robots.txt must explicitly exclude ${privateRoute}.`
  );
}

assert(
  existsSync('docs/instant-ramen-artwork-manifest.md'),
  'Original artwork must have a durable manifest with prompts, dimensions, and intended use.'
);

console.log('Instant Ramen UI and SEO rebuild contract verified.');
