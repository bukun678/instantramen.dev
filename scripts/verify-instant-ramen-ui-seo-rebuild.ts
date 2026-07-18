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
    instantRamenArtwork.gallery.length >= 12,
  'The homepage must use at least three original hero candidates and twelve varied gallery images.'
);

const artworkCategories = new Set<string>(
  instantRamenArtwork.gallery.map((artwork) => artwork.category)
);
for (const category of [
  'Portrait',
  'Product advertising',
  'Food photography',
  'Social campaign',
  'Children’s illustration',
  'Interior design',
  'Pet concept',
  'Cinematic scene',
]) {
  assert(
    artworkCategories.has(category),
    `The refreshed gallery must include ${category}.`
  );
}

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
  homeTemplate.includes('data-hero-artwork="primary"') &&
    homeTemplate.includes('data-mobile-hero-artwork="primary-only"') &&
    homeTemplate.includes('data-model-layout={index === 0') &&
    homeTemplate.includes("? 'featured'") &&
    homeTemplate.includes('data-mobile-gallery="rail"'),
  'Homepage visual hierarchy must keep one dominant hero, a differentiated model layout, and a compact mobile gallery rail.'
);
assert(
  homeTemplate.includes('lg:pt-28') &&
    homeTemplate.includes('lg:text-[5.625rem]') &&
    homeTemplate.includes('lg:mt-10'),
  'Desktop hero spacing and heading scale must remain tightened without changing the mobile heading scale.'
);
assert(
  homeTemplate.includes('lg:min-h-[504px]'),
  'The featured GPT Image 2 showcase artwork must remain approximately ten percent shorter.'
);
assert(
  homeTemplate.includes('data-gallery-prompt') &&
    homeTemplate.includes('Example creation ·') &&
    homeTemplate.includes('getArtworkPromptSummary') &&
    !homeTemplate.includes('{artwork.prompt}'),
  'Gallery cards must expose a concise prompt summary instead of covering artwork with the full prompt.'
);
assert(
  homeTemplate.includes('hover:border-orange-300/25') &&
    homeTemplate.includes('group-focus-visible:') &&
    !homeTemplate.includes('group-focus:'),
  'Gallery hover emphasis must stay subtle while the full overlay and ring remain keyboard focus-visible only.'
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
  generatorTemplate.includes('Try an example prompt') &&
    generatorTemplate.includes('data-generator-empty-state'),
  'The generator result canvas must provide a useful, modern empty state.'
);
assert(
  generatorTemplate.includes('data-model-slug={option.slug}') &&
    !generatorTemplate.includes('aria-label={'),
  'Model choices must expose their complete visible name and status to assistive technology.'
);
assert(
  generatorTemplate.includes('data-mobile-model-card') &&
    generatorTemplate.includes('min-h-[72px]') &&
    generatorTemplate.includes('py-1.5') &&
    generatorTemplate.includes('sm:min-h-24') &&
    generatorTemplate.includes('text-balance') &&
    !generatorTemplate.includes('Roadmap model'),
  'Mobile model cards must be more compact, keep names to two balanced lines, and avoid duplicated roadmap copy.'
);

for (const [slug, title] of [
  ['gpt-image-2', 'GPT Image 2 Generator'],
  ['nano-banana', 'Nano Banana 2 Generator'],
  ['instant-ramen', 'Instant Ramen AI Image Model'],
] as const) {
  assert(
    getInstantRamenModelBySlug(slug)?.heroTitle === title,
    `${slug} must use the concise, unbroken model-page heading.`
  );
}
assert(
  getInstantRamenModelBySlug('gpt-image-2')?.heroDescription.includes(
    'Create detailed AI images from text prompts'
  ),
  'GPT Image 2 must move its descriptive promise into the subtitle.'
);
assert(
  modelTemplate.includes('whitespace-nowrap') &&
    modelTemplate.includes('lg:grid-cols-[0.9fr_1.1fr]') &&
    modelTemplate.includes('lg:min-h-[560px]'),
  'Model heroes must keep model names together and give product copy more visual weight.'
);

const galleryCategories = instantRamenArtwork.gallery
  .slice(0, 6)
  .map((artwork) => artwork.category);
assert(
  galleryCategories.join(',') ===
    [
      'Portrait',
      '3D product visual',
      'Food photography',
      'Website hero',
      'Social campaign',
      'Interior design',
    ].join(','),
  'Gallery ordering must separate vivid campaign work with neutral product, travel, or interior examples.'
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
  globalStyles.includes('--instant-ramen-font-sans:') &&
    globalStyles.includes('font-family: var(--instant-ramen-font-sans)') &&
    globalStyles.includes('.instant-ramen-footer a'),
  'Instant Ramen surfaces must use a modern scoped sans stack while retaining accessible footer links.'
);
assert(
  globalStyles.includes('--muted-foreground: oklch(0.73') &&
    globalStyles.includes('--muted-foreground: oklch(0.82'),
  'Dark surfaces and navigation must use slightly stronger muted text contrast without turning pure white.'
);

const headerTemplate = readFileSync(
  'src/themes/default/blocks/header.tsx',
  'utf8'
);
assert(
  headerTemplate.includes('focus-visible:ring-2') &&
    headerTemplate.includes('focus-visible:outline-none') &&
    !headerTemplate.includes('focus:ring-2'),
  'Navigation must reserve its obvious focus ring for keyboard focus-visible interaction.'
);

assert(
  modelTemplate.includes('Prompt') &&
    modelTemplate.includes('Result') &&
    modelTemplate.includes('data-model-workflow-example'),
  'Model pages must visually connect a prompt with a representative result.'
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

const animatedThemeToggler = readFileSync(
  'src/shared/components/magicui/animated-theme-toggler.tsx',
  'utf8'
);
assert(
  animatedThemeToggler.includes('focus-visible:ring-2') &&
    animatedThemeToggler.includes('outline-none') &&
    !animatedThemeToggler.includes('focus:ring-2'),
  'Theme toggle emphasis must appear only for keyboard focus-visible interaction.'
);
assert(
  animatedThemeToggler.includes("event.pointerType === 'mouse'") &&
    animatedThemeToggler.includes('event.currentTarget.blur()'),
  'Mouse activation must release focus so the keyboard-only theme focus ring does not persist.'
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
