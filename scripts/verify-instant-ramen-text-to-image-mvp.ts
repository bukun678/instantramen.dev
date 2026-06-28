import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  applyInstantRamenBrandToLandingLayout,
  getInstantRamenGeneratorEntryModels,
  getInstantRamenModelBySlug,
  instantRamenTextToImageMvpModels,
} from '../src/domains/instant-ramen';

const projectRoot = process.cwd();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8');
}

const allowedGenerationModelLabels = ['GPT Image 2', 'Nano Banana'];
const allowedGenerationModelSlugs = ['gpt-image-2', 'nano-banana'];
const allowedEntryModelSlugs = [
  'gpt-image-2',
  'nano-banana',
  'instant-ramen',
];

assert(
  instantRamenTextToImageMvpModels.length === 2,
  'MVP generation model list must expose exactly two models.'
);

for (const model of instantRamenTextToImageMvpModels) {
  assert(
    allowedGenerationModelLabels.includes(model.label),
    `Unexpected MVP generation model label: ${model.label}.`
  );
  assert(
    allowedGenerationModelSlugs.includes(model.slug),
    `Unexpected MVP generation model slug: ${model.slug}.`
  );
}

const generatorEntryModels = getInstantRamenGeneratorEntryModels();

assert(
  generatorEntryModels.length === 3,
  'Primary generator entry must expose GPT Image 2, Nano Banana, and Instant Ramen Coming Soon only.'
);

for (const model of generatorEntryModels) {
  assert(
    allowedEntryModelSlugs.includes(model.slug),
    `Unexpected primary generator entry model: ${model.slug}.`
  );
  assert(model.visible, `${model.slug} must be visible when shown in the generator entry.`);
  assert(model.enabled, `${model.slug} must be enabled in the product catalog.`);
  assert(
    model.showInGenerator,
    `${model.slug} must explicitly opt into the generator entry.`
  );
}

for (const slug of allowedGenerationModelSlugs) {
  const model = getInstantRamenModelBySlug(slug);

  assert(model, `Missing required MVP model config: ${slug}.`);
  assert(model.status === 'available', `${slug} must be available.`);
  assert(model.availability === 'available', `${slug} availability must be available.`);
  assert(model.allowGeneration, `${slug} must allow generation.`);
  assert(model.showInGenerator, `${slug} must appear in the generator entry.`);
}

const instantRamenModel = getInstantRamenModelBySlug('instant-ramen');

assert(instantRamenModel, 'Missing Instant Ramen model config.');
assert(
  instantRamenModel.status === 'coming-soon',
  'Instant Ramen model status must be coming-soon.'
);
assert(
  instantRamenModel.availability === 'coming-soon',
  'Instant Ramen model availability must be coming-soon.'
);
assert(
  !instantRamenModel.allowGeneration,
  'Instant Ramen model must not allow generation.'
);
assert(
  instantRamenModel.showInGenerator,
  'Instant Ramen model should be shown as Coming Soon in the primary generator entry.'
);

for (const model of generatorEntryModels) {
  if (!allowedEntryModelSlugs.includes(model.slug)) {
    throw new Error(`${model.slug} must not appear in the primary generator entry.`);
  }
}

const homePage = read('src/domains/instant-ramen/components/home-landing-page.tsx');
const generatorPage = read(
  'src/domains/instant-ramen/components/seo-tool-page.tsx'
);
const generatorRoute = read(
  'src/app/[locale]/(landing)/(ai)/ai-image-generator/page.tsx'
);
const apiRoute = read('src/app/api/instant-ramen/text-to-image/route.ts');

assert(
  homePage.includes('InstantRamenTextToImageMvp'),
  'Homepage must render the text-to-image MVP entry.'
);
assert(
  generatorPage.includes('InstantRamenTextToImageMvp'),
  '/ai-image-generator must render the text-to-image MVP entry.'
);
assert(
  generatorRoute.includes('InstantRamenSeoToolPage'),
  '/ai-image-generator route should keep using the Instant Ramen tool page wrapper.'
);
assert(
  apiRoute.includes('generateInstantRamenTextToImage'),
  'Text-to-image API route must use the Instant Ramen adapter.'
);
assert(
  apiRoute.includes('createInstantRamenSupabaseServerClient'),
  'Text-to-image API route must validate Supabase session server-side.'
);

const mvpComponent = read(
  'src/domains/instant-ramen/components/text-to-image-mvp.tsx'
);

for (const requiredPhrase of [
  'textarea',
  'Generate',
  'Loading',
  'Error',
  'Download',
  '/api/instant-ramen/text-to-image',
]) {
  assert(
    mvpComponent.includes(requiredPhrase),
    `MVP component must include "${requiredPhrase}".`
  );
}

for (const forbiddenPhrase of [
  'FLUX',
  'Imagen',
  'Recraft',
  'Ideogram',
  'Showcases',
  'Customers',
  'Testimonials',
  '/compare',
]) {
  assert(
    !mvpComponent.includes(forbiddenPhrase),
    `MVP component must not promote "${forbiddenPhrase}".`
  );
}

const brandedLayout = applyInstantRamenBrandToLandingLayout({
  header: {
    id: 'header',
    brand: { title: 'ShipAny', url: '/' },
    nav: {
      items: [
        { title: 'Showcases', url: '/showcases' },
        { title: 'Demo', url: '/demo' },
        { title: 'AI Video Generator', url: '/ai-video-generator' },
      ],
    },
    topbanner: {
      text: 'ShipAny demo',
    },
  } as any,
  footer: {
    id: 'footer',
    brand: { title: 'ShipAny', url: '/' },
    nav: {
      items: [
        { title: 'Friends', children: [{ title: 'ShipAny', url: 'https://shipany.ai' }] },
      ],
    },
    social: {
      items: [{ title: 'Github', url: 'https://github.com/your-app-name' }],
    },
    show_built_with: true,
  } as any,
});

const serializedLayout = JSON.stringify(brandedLayout).toLowerCase();

for (const forbiddenLayoutPhrase of [
  'showcases',
  'demo',
  'testimonial',
  'customer',
  'shipany.ai',
  'github.com/your-app-name',
  'ai-video-generator',
  'ai-music-generator',
]) {
  assert(
    !serializedLayout.includes(forbiddenLayoutPhrase),
    `Landing layout must not expose template residue "${forbiddenLayoutPhrase}".`
  );
}

console.log('Instant Ramen text-to-image MVP entry verified.');
