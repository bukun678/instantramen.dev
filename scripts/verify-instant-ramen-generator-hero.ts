import { existsSync, readFileSync } from 'node:fs';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const heroPath =
  'src/domains/instant-ramen/components/ai-image-generator-hero.tsx';
assert(
  existsSync(heroPath),
  'The mode-aware generator Hero component is missing.'
);

const hero = readFileSync(heroPath, 'utf8');
const toolPage = readFileSync(
  'src/domains/instant-ramen/components/seo-tool-page.tsx',
  'utf8'
);
const generator = readFileSync(
  'src/domains/instant-ramen/components/text-to-image-mvp.tsx',
  'utf8'
);
const content = readFileSync(
  'src/domains/instant-ramen/content/pages.ts',
  'utf8'
);
const route = readFileSync(
  'src/app/[locale]/(landing)/(ai)/ai-image-generator/page.tsx',
  'utf8'
);

for (const copy of [
  'AI IMAGE GENERATOR',
  'Create images from a prompt.',
  'Describe what you want, choose a model, and generate your image in seconds.',
  'IMAGE TO IMAGE',
  'Transform any image with AI.',
  'Upload a reference image, describe the change, and create a new version.',
]) {
  assert(hero.includes(copy), `Hero copy is missing: ${copy}`);
}

assert(
  !hero.toLowerCase().includes('seo tool page') &&
    !hero.toLowerCase().includes('seo page positions'),
  'The mode-aware Hero still contains internal SEO positioning copy.'
);
assert(
  !content.includes("eyebrow: 'Text to Image · SEO Tool Page'") &&
    !content.includes('This SEO page positions ${productName}'),
  'The AI Image Generator content still contains its old internal SEO copy.'
);

assert(
  hero.includes('useSearchParams') &&
    hero.includes('data-ai-generator-hero') &&
    hero.includes('max-w-4xl') &&
    hero.includes('max-w-2xl') &&
    hero.includes('py-12') &&
    hero.includes('lg:py-[4.5rem]') &&
    !hero.includes('min-h-'),
  'Hero must be mode-aware, content-sized, and use the approved compact widths and padding.'
);
assert(
  toolPage.includes('InstantRamenAiImageGeneratorHero') &&
    toolPage.includes('pt-4') &&
    !toolPage.includes('pt-28 pb-12'),
  'The tool page must render the compact Hero and remove the old oversized spacing.'
);
assert(
  generator.includes('router.replace') && generator.includes('scroll: false'),
  'Mode changes must keep the URL-backed Hero synchronized without scrolling.'
);
assert(
  route.includes('getMetadata') && route.includes('content.seo'),
  'The generator route must retain its independent metadata configuration.'
);

console.log('Instant Ramen generator Hero verified.');
