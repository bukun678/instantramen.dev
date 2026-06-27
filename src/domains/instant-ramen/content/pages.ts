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
      title: 'AI Image Generator for Text to Image Creation',
      description:
        'Generate images from text prompts with Instant Ramen, a multi-model AI image generation platform for prompt driven generation.',
      keywords:
        'AI image generator, text to image, prompt driven generation, multi-model AI image generation platform, Instant Ramen image generator',
      noIndex: false,
    }),
    eyebrow: 'Text to Image · SEO Tool Page',
    headline: 'AI Image Generator for prompt driven creation',
    summary:
      `${productName} turns prompts into images across a future-ready provider layer. This SEO page positions ${productName} as a multi-model AI image generation platform, not a single-model site.`,
    primaryCta: { label: 'Open Create', href: '/create' },
    secondaryCta: { label: 'Compare models', href: '/models/instant-ramen' },
    sections: [
      {
        id: 'hero',
        label: 'Text to Image',
        title: 'Create images from natural language prompts',
        description:
          'Use Text to Image workflows to describe a scene, product concept, character, ad creative, or thumbnail idea, then generate visual directions with AI image models.',
        cta: { label: 'Start text to image', href: '/create' },
      },
      {
        id: 'value-proposition',
        label: 'Multi-model platform',
        title: `${productName} is built beyond one model`,
        description:
          `${productName} is a multi-model AI image generation platform, not a single-model website. The page should introduce prompt driven generation while reserving provider flexibility for Nano Banana, GPT Image 2, Instant Ramen, and future image models.`,
        items: [
          {
            title: 'Prompt driven generation',
            description:
              'Write a prompt, choose an image direction, and use model options to turn ideas into visual outputs.',
          },
          {
            title: 'Provider-ready model layer',
            description:
              'Future providers can expose their own capabilities without forcing the Create page to hardcode model logic.',
          },
          {
            title: 'Generation and editing together',
            description:
              'Text to Image is the acquisition page, while the product can later connect image editing, history, and credits inside Create.',
          },
        ],
      },
      {
        id: 'use-cases',
        label: 'Use cases',
        title: 'Use AI image generation for everyday creative work',
        description:
          'This page targets searchers who need a practical AI image generator for prompt-first image creation.',
        items: [
          {
            title: 'Marketing concepts',
            description:
              'Generate campaign visuals, ad scenes, and landing page image directions before design production.',
          },
          {
            title: 'Creator thumbnails',
            description:
              'Explore video covers, social images, and style directions from short prompts.',
          },
          {
            title: 'Product and brand mockups',
            description:
              'Turn product descriptions into visual concepts, packaging ideas, and brand mood boards.',
          },
        ],
      },
      {
        id: 'workflow',
        label: 'Workflow',
        title: 'From prompt to generated image',
        description:
          'The production workflow will live in Create. This SEO page explains the path without calling a real provider in Phase 6.',
        steps: [
          {
            title: 'Write a prompt',
            description:
              'Describe the subject, style, composition, lighting, and output intent.',
          },
          {
            title: 'Choose model capabilities',
            description:
              'Select a model/provider based on supported modes, aspect ratios, quality, and credit cost.',
          },
          {
            title: 'Generate and iterate',
            description:
              'Review outputs, reuse promising prompts, and continue into editing or history in later product phases.',
          },
        ],
      },
      {
        id: 'faq',
        label: 'FAQ',
        title: 'AI image generator FAQ',
        description:
          'Short SEO answers for text-to-image visitors before the full tool is connected.',
        faq: [
          {
            question: `Is ${productName} only a Nano Banana site?`,
            answer:
              `No. ${productName} is intentionally positioned as a multi-model AI image generation platform, not a single-model site.`,
          },
          {
            question: 'Does this page call a real AI provider today?',
            answer:
              'No. Phase 6 only adds the SEO content skeleton and front-end display placeholder. Provider execution comes later.',
          },
          {
            question: 'Can Text to Image connect with editing later?',
            answer:
              'Yes. Text to Image and Image Editing are both reserved in the Instant Ramen product direction.',
          },
        ],
      },
      {
        id: 'final-cta',
        label: 'CTA',
        title: 'Start with a prompt, then build a repeatable image workflow',
        description:
          `${productName} connects SEO acquisition to a Create workspace where prompt driven generation, provider selection, credits, and history can grow together.`,
        cta: { label: 'Open Create', href: '/create' },
      },
    ],
  },
  aiImageEditor: {
    routeKey: 'aiImageEditor',
    kind: 'seo-tool',
    seo: seo({
      routeKey: 'aiImageEditor',
      title: 'AI Image Editor for Prompt-Based Image Editing',
      description:
        'Edit existing images with prompts using Instant Ramen, an AI image generation platform for image editing and image to image workflows.',
      keywords:
        'AI image editor, image editing, image to image, edit existing images with prompts, Instant Ramen editor',
      noIndex: false,
    }),
    eyebrow: 'Image Editing · SEO Tool Page',
    headline: 'AI Image Editor for existing images',
    summary:
      `${productName} helps creators move from an existing image to a new visual direction with prompt-based image editing. This SEO page introduces Image Editing and Image to Image as part of a broader provider-ready image platform.`,
    primaryCta: { label: 'Open editor', href: '/create/edit' },
    secondaryCta: { label: 'Explore generator', href: '/ai-image-generator' },
    sections: [
      {
        id: 'hero',
        label: 'Image Editing',
        title: 'Edit existing images with prompts',
        description:
          'Upload or reuse an image, describe the change you want, and prepare for image to image workflows that transform visuals without starting from scratch.',
        cta: { label: 'Open image editor', href: '/create/edit' },
      },
      {
        id: 'value-proposition',
        label: 'Prompt-based editing',
        title: 'Image editing should stay connected to generation',
        description:
          `${productName} is an AI image generation platform, not a single-model site. Image Editing, Image to Image, provider capabilities, and model selection should all share the same product foundation.`,
        items: [
          {
            title: 'Edit existing images with prompts',
            description:
              'Describe background swaps, object changes, style adjustments, and creative refinements in natural language.',
          },
          {
            title: 'Image to Image workflow',
            description:
              'Use an existing image as the source and guide the next version through prompt-based direction.',
          },
          {
            title: 'Provider capability mapping',
            description:
              'Different providers may support image input, masks, aspect ratios, or negative prompts; the page stays model-agnostic.',
          },
        ],
      },
      {
        id: 'use-cases',
        label: 'Use cases',
        title: 'Use AI image editing when the first image is already close',
        description:
          'This page targets creators who want to refine, transform, or repurpose existing images with prompts.',
        items: [
          {
            title: 'Product image refinement',
            description:
              'Adjust backgrounds, presentation style, color mood, and scene direction for product visuals.',
          },
          {
            title: 'Social creative variation',
            description:
              'Turn one visual into multiple campaign directions without rebuilding every asset manually.',
          },
          {
            title: 'Concept iteration',
            description:
              'Keep the composition you like and prompt changes to style, setting, lighting, or details.',
          },
        ],
      },
      {
        id: 'workflow',
        label: 'Workflow',
        title: 'From source image to edited output',
        description:
          'The real editor will live under Create. Phase 6 only presents the SEO explanation and front-end placeholder.',
        steps: [
          {
            title: 'Choose or upload an image',
            description:
              'Start from an existing visual, generated result, product photo, or concept image.',
          },
          {
            title: 'Describe the edit',
            description:
              'Use prompts to explain what should change, what should stay consistent, and what style to apply.',
          },
          {
            title: 'Iterate across models',
            description:
              'Future provider capabilities will determine which models are best for editing, image to image, or mask-aware refinement.',
          },
        ],
      },
      {
        id: 'faq',
        label: 'FAQ',
        title: 'AI image editor FAQ',
        description:
          'Short SEO answers for image editing visitors before real provider execution is connected.',
        faq: [
          {
            question: 'Is Image Editing separate from generation?',
            answer:
              `No. ${productName} treats Image Editing as part of the same AI image generation platform, sharing model, provider, credits, and history concepts over time.`,
          },
          {
            question: 'Does this support Image to Image?',
            answer:
              'The content and model schema reserve Image to Image workflows. Real execution will be connected in a later phase.',
          },
          {
            question: 'Is this tied to one provider?',
            answer:
              `No. ${productName} is not a single-model site. Provider capabilities are designed to stay decoupled from the page UI.`,
          },
        ],
      },
      {
        id: 'final-cta',
        label: 'CTA',
        title: 'Bring existing images into the Create workspace',
        description:
          'Start from an image, use prompts to define the edit, and later continue into history, prompt reuse, credits, and provider-specific capabilities.',
        cta: { label: 'Open editor', href: '/create/edit' },
      },
    ],
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
