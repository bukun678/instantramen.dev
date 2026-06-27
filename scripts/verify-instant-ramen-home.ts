import { instantRamenPageContent } from '../src/domains/instant-ramen';

const requiredSectionIds = [
  'hero',
  'value-proposition',
  'use-cases',
  'models-preview',
  'workflow-preview',
  'pricing-cta',
  'faq',
  'final-cta',
] as const;

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const home = instantRamenPageContent.home;
const sections = home.sections ?? [];
const sectionIds = sections.map((section) => section.id);
const homeText = JSON.stringify(home).toLowerCase();

for (const id of requiredSectionIds) {
  assert(sectionIds.includes(id), `Home section "${id}" is required`);
}

assert(
  homeText.includes('ai image generation platform'),
  'Home content must position Instant Ramen as an AI image generation platform'
);
assert(
  homeText.includes('not a single-model'),
  'Home content must clarify Instant Ramen is not a single-model site'
);
assert(
  homeText.includes('text to image') || homeText.includes('text-to-image'),
  'Home content must mention Text to Image'
);
assert(
  homeText.includes('image editing') || homeText.includes('image-editing'),
  'Home content must mention Image Editing'
);
assert(
  homeText.includes('provider'),
  'Home content must reserve future provider architecture messaging'
);

console.log('Instant Ramen home landing content verified.');
