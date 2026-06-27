import {
  instantRamenModels,
  instantRamenPageContent,
  instantRamenRoutes,
} from '../src/domains/instant-ramen';

const requiredPageKeys = [
  'home',
  'aiImageGenerator',
  'aiImageEditor',
  'pricing',
  'modelInstantRamen',
  'modelNanoBanana',
  'modelGptImage2',
  'create',
  'createEdit',
  'createHistory',
] as const;

const requiredModelSlugs = [
  'instant-ramen',
  'nano-banana',
  'gpt-image-2',
] as const;

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const key of requiredPageKeys) {
  const page = instantRamenPageContent[key];
  const route = instantRamenRoutes[key];

  assert(Boolean(page), `Missing page content for ${key}`);
  assert(Boolean(route), `Missing route config for ${key}`);
  assert(page.seo.canonical === route.path, `${key} canonical must match route`);
  assert(Boolean(page.seo.title), `${key} must have seo title`);
  assert(Boolean(page.seo.description), `${key} must have seo description`);
  assert(Boolean(page.seo.keywords), `${key} must have seo keywords`);
  assert(Boolean(page.seo.openGraph.title), `${key} must have OG title`);
  assert(
    Boolean(page.seo.openGraph.description),
    `${key} must have OG description`
  );

  if (route.kind === 'app') {
    assert(page.seo.noIndex === true, `${key} app route must be noIndex`);
  } else {
    assert(page.seo.noIndex === false, `${key} SEO route must be indexable`);
  }
}

for (const slug of requiredModelSlugs) {
  const model = instantRamenModels.find((item) => item.slug === slug);

  assert(Boolean(model), `Missing model config for ${slug}`);
  assert(Boolean(model?.provider), `${slug} must reserve provider`);
  assert(Boolean(model?.providerModelId), `${slug} must reserve providerModelId`);
  assert(
    Boolean(model?.capabilities.executionMode),
    `${slug} must reserve provider execution capabilities`
  );
  assert(
    model!.supportedModes.length > 0,
    `${slug} must declare supported modes`
  );
  assert(
    model!.aspectRatios.includes('3:4'),
    `${slug} must include 3:4 aspect ratio`
  );
  assert(
    typeof model!.creditCost === 'number',
    `${slug} must declare credit cost`
  );
  assert(Boolean(model!.seoTitle), `${slug} must have SEO title`);
  assert(Boolean(model!.seoDescription), `${slug} must have SEO description`);
}

console.log('Instant Ramen SEO content config verified.');
