import { instantRamenBrandConfig } from '../config/brand';
import { instantRamenRoutes } from '../config/routes';
import type { InstantRamenRouteKey } from '../config/routes';
import { instantRamenModels } from './models';
import type { InstantRamenPageContentConfig } from './types';

const productName = instantRamenBrandConfig.productName;

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
        `Create and edit images online with ${productName}. Use Nano Banana and GPT Image 2 today, with the ${productName} model coming soon.`,
      keywords:
        'Instant Ramen, AI image generator, AI image editor, Nano Banana, GPT Image 2',
      noIndex: false,
    }),
    eyebrow: `${productName} Image Model · Coming Soon`,
    headline: `${productName} AI Image Generator`,
    summary:
      `Create and edit images with leading AI models. ${productName} is an AI image generation platform, not a single-model site, with Text to Image, Image Editing, and future provider expansion built into the product direction.`,
    primaryCta: { label: 'Start creating', href: '/create' },
    secondaryCta: { label: 'Explore models', href: '/models/instant-ramen' },
    sections: [
      {
        id: 'hero',
        label: 'AI Image Generation Platform',
        title: `${productName} is your multi-model image workspace`,
        description:
          `${productName} brings Text to Image and Image Editing into one creator workflow. The homepage should make it clear this is not a single-model website; it is the front door for a broader AI image generation platform.`,
        cta: { label: 'Start creating', href: '/create' },
      },
      {
        id: 'value-proposition',
        label: 'Product value proposition',
        title: 'Generate, edit, compare, and keep moving',
        description:
          'Creators should be able to move from prompt to image, from image to edit, and from one model provider to another without rebuilding their workflow.',
        items: [
          {
            title: 'Text to Image',
            description:
              'Turn product shots, concept art, thumbnails, and campaign ideas into generated visuals.',
          },
          {
            title: 'Image Editing',
            description:
              'Refine existing images with prompt-based edits and future mask-aware editing flows.',
          },
          {
            title: 'Provider-ready architecture',
            description:
              'The product direction reserves a Provider → Model → Capabilities → Execution architecture for future expansion.',
          },
        ],
      },
      {
        id: 'use-cases',
        label: 'Use cases',
        title: 'Built for everyday creative image work',
        description:
          'The homepage content targets practical search and conversion intent for AI image generation SaaS users.',
        items: [
          {
            title: 'Creator thumbnails',
            description:
              'Create fast visual directions for video covers, social posts, and content experiments.',
          },
          {
            title: 'Product concepts',
            description:
              'Explore packaging, mockups, advertising scenes, and product mood boards.',
          },
          {
            title: 'Character and style exploration',
            description:
              'Iterate on visual styles, characters, and campaign assets before committing to a final direction.',
          },
        ],
      },
      {
        id: 'models-preview',
        label: 'Supported models preview',
        title: 'A platform for multiple image models',
        description:
          `${productName} is not a single-model site. The model layer is designed to support multiple providers and model capabilities over time.`,
        items: instantRamenModels.map((model) => ({
          title: model.displayName,
          description: model.description,
          badge: model.status,
          href: `/models/${model.slug}`,
        })),
      },
      {
        id: 'workflow-preview',
        label: 'Create workflow preview',
        title: 'From prompt to generation history',
        description:
          'The Create workspace is separate from SEO pages and will become the product entry point for generation, editing, prompt reuse, and history.',
        steps: [
          {
            title: 'Choose a mode',
            description:
              'Start with Text to Image or Image Editing depending on the creative task.',
          },
          {
            title: 'Select a model',
            description:
              'Pick the provider/model combination that fits quality, speed, and credit cost.',
          },
          {
            title: 'Reuse what works',
            description:
              'History, prompt reuse, favorites, and templates are reserved for later product phases.',
          },
        ],
        cta: { label: 'Open Create workspace', href: '/create' },
      },
      {
        id: 'pricing-cta',
        label: 'Credits preview',
        title: 'Credit-based pricing for generation and editing',
        description:
          'ShipAny billing and credits stay as the SaaS foundation, while Instant Ramen maps model cost and usage into a creator-friendly pricing story.',
        cta: { label: 'View pricing', href: '/pricing' },
      },
      {
        id: 'faq',
        label: 'FAQ',
        title: 'Questions creators ask before trying an AI image platform',
        description:
          'Short answers that clarify product positioning before full FAQ content is migrated.',
        faq: [
          {
            question: `Is ${productName} only for one AI model?`,
            answer:
              `No. ${productName} is positioned as an AI image generation platform, not a single-model website. The model provider layer is designed to expand.`,
          },
          {
            question: 'Will it support both Text to Image and Image Editing?',
            answer:
              'Yes. The homepage, Create routes, and model configuration already reserve both Text to Image and Image Editing workflows.',
          },
          {
            question: 'Are real AI providers connected in this phase?',
            answer:
              'No. This phase only establishes the homepage content skeleton and conversion structure. Provider execution comes later.',
          },
        ],
      },
      {
        id: 'final-cta',
        label: 'Final CTA',
        title: 'Start with the image workflow, then grow into the platform',
        description:
          `${productName} will connect SEO acquisition pages to a real Create workspace for generation, editing, history, billing, and future prompt libraries.`,
        cta: { label: 'Start creating', href: '/create' },
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
