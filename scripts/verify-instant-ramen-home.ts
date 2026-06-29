import { readFileSync } from 'node:fs';

import {
  buildInstantRamenFaqSchema,
  buildInstantRamenOrganizationSchema,
  buildInstantRamenWebApplicationSchema,
  buildInstantRamenWebSiteSchema,
  instantRamenPageContent,
} from '../src/domains/instant-ramen';

const requiredSectionIds = [
  'hero',
  'what-is-instant-ramen',
  'supported-models',
  'key-features',
  'examples',
  'how-it-works',
  'use-cases',
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
const homePageFile = readFileSync(
  'src/domains/instant-ramen/components/home-landing-page.tsx',
  'utf8'
);

for (const id of requiredSectionIds) {
  assert(sectionIds.includes(id), `Home section "${id}" is required`);
}

assert(
  homePageFile.includes('InstantRamenTextToImageMvp'),
  'Homepage must keep the first-screen Prompt → Model → Generate MVP component'
);

assert(
  home.seo.title.includes('GPT Image 2') &&
    home.seo.title.includes('Nano Banana 2'),
  'Homepage SEO title must include GPT Image 2 and Nano Banana 2'
);

assert(
  home.seo.description.includes('GPT Image 2') &&
    home.seo.description.includes('Nano Banana 2'),
  'Homepage SEO description must include GPT Image 2 and Nano Banana 2'
);

const faqSection = sections.find((section) => section.id === 'faq');

assert(Boolean(faqSection?.faq), 'Home FAQ section must include FAQ items');
assert(
  faqSection!.faq!.length >= 8,
  'Home FAQ section must include at least 8 FAQ items'
);

for (const question of [
  'What is Instant Ramen?',
  'What is GPT Image 2?',
  'What is Nano Banana 2?',
  'Which AI models are supported?',
  'Is Instant Ramen available now?',
  'Can I generate AI images for free?',
  'Can I download generated images?',
  'Does Instant Ramen support image editing?',
]) {
  assert(
    faqSection!.faq!.some((item) => item.question === question),
    `Home FAQ must include "${question}"`
  );
}

for (const builder of [
  'buildInstantRamenFaqSchema',
  'buildInstantRamenWebApplicationSchema',
  'buildInstantRamenWebSiteSchema',
  'buildInstantRamenOrganizationSchema',
]) {
  assert(
    homePageFile.includes(builder),
    `Homepage must render structured data through ${builder}`
  );
}

assert(
  buildInstantRamenFaqSchema(faqSection!.faq!)['@type'] === 'FAQPage',
  'FAQ schema must be FAQPage'
);
assert(
  buildInstantRamenWebApplicationSchema()['@type'] === 'WebApplication',
  'Homepage app schema must be WebApplication'
);
assert(
  buildInstantRamenWebSiteSchema()['@type'] === 'WebSite',
  'Homepage site schema must be WebSite'
);
assert(
  buildInstantRamenOrganizationSchema()['@type'] === 'Organization',
  'Homepage organization schema must be Organization'
);

assert(
  homeText.includes('ai image generator'),
  'Home content must position Instant Ramen as an AI Image Generator'
);
assert(
  homeText.includes('gpt image 2'),
  'Home content must mention GPT Image 2'
);
assert(
  homeText.includes('nano banana 2'),
  'Home content must mention Nano Banana 2'
);
assert(
  homeText.includes('coming soon'),
  'Home content must mention the Instant Ramen model is Coming Soon'
);
assert(
  homeText.includes('text prompts'),
  'Home content must mention text prompts'
);

console.log('Instant Ramen home landing content verified.');
