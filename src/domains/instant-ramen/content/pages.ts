import { instantRamenBrandConfig } from '../config/brand';
import { instantRamenRoutes } from '../config/routes';
import type { InstantRamenRouteKey } from '../config/routes';
import type { InstantRamenPageContentConfig } from './types';

function og(title: string, description: string) {
  return {
    title,
    description,
    imagePath: instantRamenBrandConfig.previewImagePath,
    imageAlt: instantRamenBrandConfig.openGraph.imageAlt,
    type: 'website' as const,
  };
}

function seo({
  routeKey,
  title,
  description,
  keywords,
  noIndex,
}: {
  routeKey: InstantRamenRouteKey;
  title: string;
  description: string;
  keywords: string;
  noIndex: boolean;
}) {
  return {
    title,
    description,
    canonical: instantRamenRoutes[routeKey].path,
    keywords,
    openGraph: og(title, description),
    noIndex,
  };
}

export const instantRamenPageContent: Record<
  InstantRamenRouteKey,
  InstantRamenPageContentConfig
> = {
  home: {
    routeKey: 'home',
    kind: 'landing',
    seo: seo({
      routeKey: 'home',
      title: 'Instant Ramen AI Image Generator & Editor',
      description:
        'Create and edit images online with Instant Ramen AI. Use Nano Banana and GPT Image 2 today, with the Instant Ramen model coming soon.',
      keywords:
        'Instant Ramen, AI image generator, AI image editor, Nano Banana, GPT Image 2',
      noIndex: false,
    }),
    eyebrow: 'Instant Ramen Image Model · Coming Soon',
    headline: 'Instant Ramen AI Image Generator',
    summary:
      'Create and edit images with leading AI models. Nano Banana and GPT Image 2 are reserved as provider options while Instant Ramen prepares its own model.',
    primaryCta: { label: 'Start creating', href: '/create' },
    secondaryCta: { label: 'Explore models', href: '/models/instant-ramen' },
    sections: [
      {
        id: 'multi-model',
        title: 'Multi-model image workflow',
        description:
          'Instant Ramen is designed as a model-agnostic image platform rather than a single-model demo.',
      },
      {
        id: 'generation-editing',
        title: 'Generation and editing in one workspace',
        description:
          'The product structure separates SEO pages from the Create workspace where users generate, edit, and review history.',
      },
    ],
  },
  pricing: {
    routeKey: 'pricing',
    kind: 'landing',
    seo: seo({
      routeKey: 'pricing',
      title: 'Instant Ramen Pricing',
      description:
        'Choose the Instant Ramen plan for AI image generation, editing, and multi-model creator workflows.',
      keywords:
        'Instant Ramen pricing, AI image generator pricing, AI image editing credits',
      noIndex: false,
    }),
    headline: 'Pricing for AI image creators',
    summary:
      'Pricing will map ShipAny credits and subscriptions to Instant Ramen image generation and editing usage.',
    sections: [
      {
        id: 'credits',
        title: 'Credit-based generation',
        description:
          'Model credit costs are configured separately so pricing can evolve without hardcoding model logic into pages.',
      },
    ],
  },
  aiImageGenerator: {
    routeKey: 'aiImageGenerator',
    kind: 'seo-tool',
    seo: seo({
      routeKey: 'aiImageGenerator',
      title: 'AI Image Generator',
      description:
        'Generate images from text prompts with Instant Ramen and leading AI image models.',
      keywords:
        'AI image generator, text to image, Instant Ramen image generator',
      noIndex: false,
    }),
    headline: 'AI Image Generator',
    summary:
      'A search-focused tool page for text-to-image use cases. Full content migration comes later.',
    primaryCta: { label: 'Open Create', href: '/create' },
  },
  aiImageEditor: {
    routeKey: 'aiImageEditor',
    kind: 'seo-tool',
    seo: seo({
      routeKey: 'aiImageEditor',
      title: 'AI Image Editor',
      description:
        'Edit, refine, and transform images with Instant Ramen AI image editing tools.',
      keywords:
        'AI image editor, edit images with AI, image to image editor, Instant Ramen editor',
      noIndex: false,
    }),
    headline: 'AI Image Editor',
    summary:
      'A search-focused page for image editing queries. The real editor will live in the Create workspace.',
    primaryCta: { label: 'Open editor', href: '/create/edit' },
  },
  modelInstantRamen: {
    routeKey: 'modelInstantRamen',
    kind: 'model-seo',
    seo: seo({
      routeKey: 'modelInstantRamen',
      title: 'Instant Ramen Model',
      description:
        'Learn about the upcoming Instant Ramen image model for multi-model AI image generation and editing.',
      keywords:
        'Instant Ramen model, AI image model, image generation model',
      noIndex: false,
    }),
    headline: 'Instant Ramen Model',
    summary:
      'The flagship model slot is reserved while the Instant Ramen model is not yet publicly available.',
  },
  modelNanoBanana: {
    routeKey: 'modelNanoBanana',
    kind: 'model-seo',
    seo: seo({
      routeKey: 'modelNanoBanana',
      title: 'Nano Banana AI Image Model',
      description:
        'Use Nano Banana through Instant Ramen as part of a multi-model AI image generation and editing workflow.',
      keywords:
        'Nano Banana, Nano Banana AI, Nano Banana image generator, Instant Ramen Nano Banana',
      noIndex: false,
    }),
    headline: 'Nano Banana Model',
    summary:
      'Nano Banana is reserved as one provider option inside Instant Ramen, not the full identity of the product.',
  },
  modelGptImage2: {
    routeKey: 'modelGptImage2',
    kind: 'model-seo',
    seo: seo({
      routeKey: 'modelGptImage2',
      title: 'GPT Image 2 AI Image Model',
      description:
        'Use GPT Image 2 through Instant Ramen for AI image generation, editing, and visual iteration workflows.',
      keywords:
        'GPT Image 2, OpenAI image model, AI image generation, Instant Ramen GPT Image 2',
      noIndex: false,
    }),
    headline: 'GPT Image 2 Model',
    summary:
      'GPT Image 2 is reserved as a premium provider option in the Instant Ramen model layer.',
  },
  create: {
    routeKey: 'create',
    kind: 'app',
    seo: seo({
      routeKey: 'create',
      title: 'Create',
      description:
        'Open the Instant Ramen image generation workspace. Full generation tools will be connected in a later phase.',
      keywords: 'Instant Ramen create, image generation workspace',
      noIndex: true,
    }),
    headline: 'Create workspace',
    summary:
      'The Create workspace is the product entry point for generation, editing, history, and future prompt workflows.',
  },
  createEdit: {
    routeKey: 'createEdit',
    kind: 'app',
    seo: seo({
      routeKey: 'createEdit',
      title: 'Edit Images',
      description:
        'Open the Instant Ramen image editing workspace. Editing tools will be connected in a later phase.',
      keywords: 'Instant Ramen edit, image editing workspace',
      noIndex: true,
    }),
    headline: 'Image editing workspace',
    summary:
      'The image editing workspace is reserved for prompt-based edits, image inputs, and future mask workflows.',
  },
  createHistory: {
    routeKey: 'createHistory',
    kind: 'app',
    seo: seo({
      routeKey: 'createHistory',
      title: 'Generation History',
      description:
        'Review Instant Ramen generation history. History storage will be connected in a later phase.',
      keywords: 'Instant Ramen history, generation history',
      noIndex: true,
    }),
    headline: 'Generation history',
    summary:
      'History is reserved for generated images, reused prompts, favorites, and future collections.',
  },
};

export function getInstantRamenPageContent(routeKey: InstantRamenRouteKey) {
  return instantRamenPageContent[routeKey];
}
