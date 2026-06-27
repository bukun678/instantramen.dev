import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  applyInstantRamenBrandToLandingLayout,
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

const allowedModelLabels = ['GPT Image 2', 'Nano Banana'];
const allowedModelSlugs = ['gpt-image-2', 'nano-banana'];

assert(
  instantRamenTextToImageMvpModels.length === 2,
  'MVP entry must expose exactly two primary models.'
);

for (const model of instantRamenTextToImageMvpModels) {
  assert(
    allowedModelLabels.includes(model.label),
    `Unexpected MVP model label: ${model.label}.`
  );
  assert(
    allowedModelSlugs.includes(model.slug),
    `Unexpected MVP model slug: ${model.slug}.`
  );
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
  apiRoute.includes('mock'),
  'Text-to-image API must include a mock fallback for missing provider keys.'
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
