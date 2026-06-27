import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  getInstantRamenPageContent,
  instantRamenRoutes,
  type InstantRamenRouteKey,
} from '../src/domains/instant-ramen';

const projectRoot = process.cwd();

type ToolPageExpectation = {
  routeKey: Extract<InstantRamenRouteKey, 'aiImageGenerator' | 'aiImageEditor'>;
  routeFile: string;
  requiredSections: string[];
  requiredPhrases: string[];
  forbiddenRoutePhrases?: string[];
};

const expectations: ToolPageExpectation[] = [
  {
    routeKey: 'aiImageGenerator',
    routeFile:
      'src/app/[locale]/(landing)/(ai)/ai-image-generator/page.tsx',
    requiredSections: [
      'hero',
      'value-proposition',
      'use-cases',
      'workflow',
      'faq',
      'final-cta',
    ],
    requiredPhrases: [
      'text to image',
      'multi-model ai image generation platform',
      'prompt driven generation',
      'not a single-model',
      'provider',
    ],
    forbiddenRoutePhrases: [
      '@/shared/blocks/generator',
      '<ImageGenerator',
      'from "@/shared/blocks/generator"',
      "from '@/shared/blocks/generator'",
    ],
  },
  {
    routeKey: 'aiImageEditor',
    routeFile: 'src/app/[locale]/(landing)/ai-image-editor/page.tsx',
    requiredSections: [
      'hero',
      'value-proposition',
      'use-cases',
      'workflow',
      'faq',
      'final-cta',
    ],
    requiredPhrases: [
      'image editing',
      'image to image',
      'edit existing images with prompts',
      'not a single-model',
      'provider',
    ],
  },
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ');
}

function stringifyContent(value: unknown) {
  return normalize(JSON.stringify(value));
}

for (const expectation of expectations) {
  const route = instantRamenRoutes[expectation.routeKey];
  const content = getInstantRamenPageContent(expectation.routeKey);

  assert(
    route.kind === 'seo-tool',
    `${expectation.routeKey} must be registered as a seo-tool route.`
  );
  assert(
    content.kind === 'seo-tool',
    `${expectation.routeKey} content must use seo-tool kind.`
  );
  assert(
    content.seo.noIndex === false,
    `${expectation.routeKey} must be indexable.`
  );
  assert(
    content.seo.canonical === route.path,
    `${expectation.routeKey} canonical must match route path.`
  );

  const sectionIds = new Set(content.sections?.map((section) => section.id));
  for (const requiredSection of expectation.requiredSections) {
    assert(
      sectionIds.has(requiredSection),
      `${expectation.routeKey} section "${requiredSection}" is required.`
    );
  }

  const contentText = stringifyContent(content);
  for (const phrase of expectation.requiredPhrases) {
    assert(
      contentText.includes(phrase),
      `${expectation.routeKey} content must mention "${phrase}".`
    );
  }

  const routeFile = readFileSync(
    join(projectRoot, expectation.routeFile),
    'utf8'
  );
  assert(
    routeFile.includes('InstantRamenSeoToolPage'),
    `${expectation.routeKey} route must render InstantRamenSeoToolPage.`
  );

  for (const forbiddenPhrase of expectation.forbiddenRoutePhrases ?? []) {
    assert(
      !routeFile.includes(forbiddenPhrase),
      `${expectation.routeKey} route must not include "${forbiddenPhrase}" in Phase 6.`
    );
  }
}

console.log('Instant Ramen SEO tool pages verified.');
