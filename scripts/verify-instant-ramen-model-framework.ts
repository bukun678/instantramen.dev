import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  getInstantRamenModelBySlug,
  instantRamenModelComparisons,
  instantRamenModels,
  instantRamenSitemapRoutes,
} from '../src/domains/instant-ramen';

const projectRoot = process.cwd();

const requiredModelSlugs = [
  'instant-ramen',
  'gpt-image-2',
  'nano-banana',
  'flux',
  'imagen',
  'recraft',
  'ideogram',
] as const;

const requiredModelFields = [
  'slug',
  'name',
  'provider',
  'status',
  'availability',
  'enabled',
  'visible',
  'allowGeneration',
  'showInGenerator',
  'shortDescription',
  'heroTitle',
  'heroDescription',
  'features',
  'strengths',
  'limitations',
  'bestFor',
  'useCases',
  'faq',
  'seo',
] as const;

const dynamicModelRoutePath =
  'src/app/[locale]/(landing)/models/[slug]/page.tsx';
const modelsIndexRoutePath = 'src/app/[locale]/(landing)/models/page.tsx';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function normalize(value: unknown) {
  return JSON.stringify(value).toLowerCase().replace(/\s+/g, ' ');
}

assert(
  instantRamenModels.length >= requiredModelSlugs.length,
  'Models framework must include at least the required model set.'
);

for (const slug of requiredModelSlugs) {
  const model = getInstantRamenModelBySlug(slug);

  assert(Boolean(model), `Missing model config for ${slug}.`);

  for (const field of requiredModelFields) {
    assert(
      field in model!,
      `${slug} must include model framework field "${field}".`
    );
  }

  assert(model!.slug === slug, `${slug} slug must match lookup slug.`);
  assert(
    model!.status === 'available' || model!.status === 'coming-soon',
    `${slug} status must be available or coming-soon.`
  );
  assert(
    model!.features.length > 0,
    `${slug} must define reusable features.`
  );
  assert(
    model!.strengths.length > 0,
    `${slug} must define reusable strengths.`
  );
  assert(
    model!.limitations.length > 0,
    `${slug} must define reusable limitations.`
  );
  assert(model!.bestFor.length > 0, `${slug} must define bestFor items.`);
  assert(model!.useCases.length > 0, `${slug} must define use cases.`);
  assert(model!.faq.length > 0, `${slug} must define FAQ items.`);
  assert(Boolean(model!.seo.title), `${slug} must define SEO title.`);
  assert(
    Boolean(model!.seo.description),
    `${slug} must define SEO description.`
  );
  assert(
    model!.seo.canonical === `/models/${slug}`,
    `${slug} canonical must be data-driven from slug.`
  );
  assert(
    normalize(model).includes('multi-model ai image generation platform'),
    `${slug} must preserve Instant Ramen multi-model positioning.`
  );
}

assert(
  getInstantRamenModelBySlug('instant-ramen')!.status === 'coming-soon',
  'Instant Ramen model must be coming-soon.'
);
assert(
  getInstantRamenModelBySlug('instant-ramen')!.availability === 'coming-soon',
  'Instant Ramen model availability must be coming-soon.'
);
assert(
  !getInstantRamenModelBySlug('instant-ramen')!.allowGeneration,
  'Instant Ramen model must not be generation-enabled.'
);
assert(
  getInstantRamenModelBySlug('instant-ramen')!.showInGenerator,
  'Instant Ramen model should be visible as a Coming Soon generator entry.'
);

for (const slug of ['gpt-image-2', 'nano-banana']) {
  const model = getInstantRamenModelBySlug(slug)!;

  assert(model.availability === 'available', `${slug} availability must be available.`);
  assert(model.allowGeneration, `${slug} must be generation-enabled.`);
  assert(model.showInGenerator, `${slug} must appear in the MVP generator entry.`);
}

for (const slug of ['flux', 'imagen', 'recraft', 'ideogram']) {
  const model = getInstantRamenModelBySlug(slug)!;

  assert(
    !model.showInGenerator,
    `${slug} must not appear in the MVP generator entry.`
  );
}

for (const slug of requiredModelSlugs.filter((slug) => slug !== 'instant-ramen')) {
  assert(
    getInstantRamenModelBySlug(slug)!.status === 'available',
    `${slug} must be available.`
  );
}

const sitemapModelPaths = instantRamenSitemapRoutes
  .filter((route) => route.kind === 'model-seo')
  .map((route) => route.path);

for (const slug of requiredModelSlugs) {
  assert(
    sitemapModelPaths.includes(`/models/${slug}`),
    `${slug} must be included in sitemap routes through model config.`
  );
}

assert(
  existsSync(join(projectRoot, dynamicModelRoutePath)),
  'Dynamic /models/[slug] route is required.'
);
assert(
  existsSync(join(projectRoot, modelsIndexRoutePath)),
  '/models index route is required.'
);

const dynamicRouteFile = readFileSync(
  join(projectRoot, dynamicModelRoutePath),
  'utf8'
);
assert(
  dynamicRouteFile.includes('generateStaticParams'),
  'Dynamic model route must generate static params from model config.'
);
assert(
  dynamicRouteFile.includes('InstantRamenModelPageTemplate'),
  'Dynamic model route must use the shared model page template.'
);

const modelPageTemplate = readFileSync(
  join(projectRoot, 'src/domains/instant-ramen/components/model-page-template.tsx'),
  'utf8'
);
assert(
  modelPageTemplate.includes('model.allowGeneration'),
  'Model page CTA must branch on model generation availability.'
);
assert(
  modelPageTemplate.includes('Use GPT Image 2') &&
    modelPageTemplate.includes('Use Nano Banana 2'),
  'Coming soon model page CTA must guide users to available MVP models.'
);
assert(
  !modelPageTemplate.includes('/create?model=${model.slug}'),
  'Model page CTA must not send coming soon models to a misleading create URL.'
);

const modelsIndexFile = readFileSync(join(projectRoot, modelsIndexRoutePath), 'utf8');
assert(
  modelsIndexFile.includes('InstantRamenModelsIndexPage'),
  '/models route must use the shared models index component.'
);

assert(
  instantRamenModelComparisons.length > 0,
  'Compare framework must reserve at least one comparison config.'
);

for (const comparison of instantRamenModelComparisons) {
  assert(
    Boolean(getInstantRamenModelBySlug(comparison.leftModel)),
    `${comparison.slug} leftModel must reference an existing model.`
  );
  assert(
    Boolean(getInstantRamenModelBySlug(comparison.rightModel)),
    `${comparison.slug} rightModel must reference an existing model.`
  );
  assert(
    comparison.seo.canonical === `/compare/${comparison.slug}`,
    `${comparison.slug} comparison canonical must be data-driven from slug.`
  );
}

console.log('Instant Ramen model SEO framework verified.');
