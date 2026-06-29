import { instantRamenBrandConfig } from '../config/brand';
import { instantRamenRoutes } from '../config/routes';
import type { InstantRamenRouteKey } from '../config/routes';
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
      title: 'Instant Ramen AI Image Generator | GPT Image 2 & Nano Banana 2',
      description:
        `Generate AI images from text prompts with ${productName}. Use GPT Image 2 and Nano Banana 2 today, with the ${productName} model coming soon.`,
      keywords:
        'Instant Ramen, AI image generator, GPT Image 2, Nano Banana 2, text to image, AI image generation',
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
        id: 'what-is-instant-ramen',
        label: 'What is Instant Ramen?',
        title: `What is ${productName}?`,
        description:
          `${productName} is a new AI image generation model direction focused on creating high-quality images from text prompts. The ${productName} AI Image Generator already lets users generate AI images using GPT Image 2 and Nano Banana 2, while preparing support for the ${productName} model in the future.`,
        items: [
          {
            title: 'AI Image Generator',
            description:
              'Start with a written prompt and turn product ideas, scenes, characters, and campaign concepts into generated images.',
          },
          {
            title: 'Current model support',
            description:
              'Use GPT Image 2 and Nano Banana 2 today from the same focused generation entry.',
          },
          {
            title: `${productName} model roadmap`,
            description:
              'The Instant Ramen model is marked Coming Soon, so the page can build search demand without claiming unsupported availability.',
          },
        ],
      },
      {
        id: 'supported-models',
        label: 'Supported Models',
        title: 'Generate with GPT Image 2 and Nano Banana 2',
        description:
          `${productName} keeps the first version simple: two available image models for generation, plus the Instant Ramen model reserved as a Coming Soon option.`,
        items: [
          {
            title: 'GPT Image 2',
            description:
              'Use GPT Image 2 for prompt-driven image generation when you want a capable general-purpose model.',
            badge: 'Available',
            href: '/models/gpt-image-2',
          },
          {
            title: 'Nano Banana 2',
            description:
              'Use Nano Banana 2 for fast creative image generation and prompt iteration from the same generator.',
            badge: 'Available',
            href: '/models/nano-banana',
          },
          {
            title: 'Instant Ramen',
            description:
              'The Instant Ramen model is planned for future support and is clearly marked as Coming Soon.',
            badge: 'Coming Soon',
            href: '/models/instant-ramen',
          },
        ],
      },
      {
        id: 'key-features',
        label: 'Key Features',
        title: 'Key features for fast AI image generation',
        description:
          'The homepage explains the core product capabilities without distracting from the first-screen generator.',
        items: [
          {
            title: 'AI Image Generation',
            description:
              'Create new images from natural language prompts for everyday creative work.',
          },
          {
            title: 'Text to Image',
            description:
              'Describe the subject, composition, lighting, style, and output intent in plain text.',
          },
          {
            title: 'Multiple Aspect Ratios',
            description:
              'Choose common image ratios for square, portrait, landscape, and social visuals.',
          },
          {
            title: 'Fast Image Generation',
            description:
              'Keep the workflow focused so users can move from idea to result quickly.',
          },
          {
            title: 'Download Ready',
            description:
              'Generated results include a clear download action once the image is ready.',
          },
          {
            title: 'Image Editing Coming Soon',
            description:
              'Image editing stays on the roadmap without adding complexity to the first MVP flow.',
          },
        ],
      },
      {
        id: 'examples',
        label: 'Examples',
        title: 'Example image ideas you can generate',
        description:
          'Example scenarios help visitors understand the range of images they can create before they write their first prompt.',
        items: [
          {
            title: 'Product photo concept',
            description:
              'A clean studio-style product image for a new food, beauty, or consumer goods idea.',
          },
          {
            title: 'Social media visual',
            description:
              'A scroll-stopping image for posts, ads, banners, or campaign experiments.',
          },
          {
            title: 'Character concept',
            description:
              'A stylized character, mascot, or visual direction for storytelling and branding.',
          },
        ],
      },
      {
        id: 'how-it-works',
        label: 'How It Works',
        title: 'How to generate AI images',
        description:
          'The main workflow stays simple so visitors can understand and use the product immediately.',
        steps: [
          {
            title: 'Enter Prompt',
            description:
              'Describe the image you want to create, including subject, style, mood, and composition.',
          },
          {
            title: 'Choose GPT Image 2 or Nano Banana 2',
            description:
              'Pick one of the two available generation models from the first-screen model selector.',
          },
          {
            title: 'Generate and Download',
            description:
              'Start generation, wait for the result, then download the image when it is ready.',
          },
        ],
      },
      {
        id: 'use-cases',
        label: 'Use Cases',
        title: 'Use cases for creators and teams',
        description:
          `${productName} is designed for practical image generation tasks where speed, iteration, and clear output matter.`,
        items: [
          {
            title: 'Social Media',
            description:
              'Create visual directions for posts, thumbnails, reels, and short-form campaign ideas.',
          },
          {
            title: 'Marketing',
            description:
              'Generate concepts for ads, landing page visuals, email headers, and promotional assets.',
          },
          {
            title: 'Product Design',
            description:
              'Explore product scenes, packaging ideas, mood boards, and early visual concepts.',
          },
          {
            title: 'Character Design',
            description:
              'Create mascots, character directions, and stylized visual identities from prompts.',
          },
          {
            title: 'Blog Images',
            description:
              'Generate image ideas for articles, tutorials, explainers, and editorial content.',
          },
          {
            title: 'Concept Art',
            description:
              'Turn early creative ideas into reference images for worlds, scenes, and campaigns.',
          },
        ],
      },
      {
        id: 'faq',
        label: 'FAQ',
        title: 'Instant Ramen AI Image Generator FAQ',
        description:
          'Clear answers for visitors comparing AI image generators, supported models, and upcoming Instant Ramen model availability.',
        faq: [
          {
            question: `What is ${productName}?`,
            answer:
              `${productName} is an AI Image Generator for creating images from text prompts. It currently supports GPT Image 2 and Nano Banana 2 while preparing support for the Instant Ramen model in the future.`,
          },
          {
            question: 'What is GPT Image 2?',
            answer:
              `GPT Image 2 is one of the available generation models in ${productName}. Users can choose it from the homepage model selector before generating an image.`,
          },
          {
            question: 'What is Nano Banana 2?',
            answer:
              `Nano Banana 2 is another available image generation model in ${productName}. It is presented as a model option, not as a separate official model website.`,
          },
          {
            question: 'Which AI models are supported?',
            answer:
              `${productName} currently shows GPT Image 2 and Nano Banana 2 as available generation models. The Instant Ramen model is listed as Coming Soon.`,
          },
          {
            question: 'Is Instant Ramen available now?',
            answer:
              'The Instant Ramen model itself is marked Coming Soon. The Instant Ramen AI Image Generator is usable today with GPT Image 2 and Nano Banana 2.',
          },
          {
            question: 'Can I generate AI images for free?',
            answer:
              `${productName} is designed with a free-to-try entry and a credit-based path for generation. Exact pricing and credit rules can evolve as the MVP is validated.`,
          },
          {
            question: 'Can I download generated images?',
            answer:
              'Yes. When a generated image is ready, the result panel includes a download action.',
          },
          {
            question: 'Does Instant Ramen support image editing?',
            answer:
              'Image Editing is planned as a follow-up workflow. The first homepage flow stays focused on Text to Image generation.',
          },
        ],
      },
      {
        id: 'final-cta',
        label: 'Final CTA',
        title: 'Start Generating Images',
        description:
          'Enter a prompt, choose GPT Image 2 or Nano Banana 2, and generate your first AI image with Instant Ramen.',
        cta: { label: 'Start Generating Images', href: '/' },
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
      'Pricing will map credits and subscriptions to Instant Ramen image generation and editing usage.',
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
          `${productName} is a multi-model AI image generation platform, not a single-model website. The page should introduce prompt driven generation while reserving provider flexibility for Nano Banana 2, GPT Image 2, Instant Ramen, and future image models.`,
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
            question: `Is ${productName} only a Nano Banana 2 site?`,
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
  models: {
    routeKey: 'models',
    kind: 'model-seo',
    seo: seo({
      routeKey: 'models',
      title: 'AI Image Models',
      description:
        'Explore AI image models available inside Instant Ramen, a multi-model AI image generation platform.',
      keywords:
        'AI image models, image generation models, multi-model AI image generation platform',
      noIndex: false,
    }),
    eyebrow: 'Models Framework',
    headline: 'AI image models inside Instant Ramen',
    summary:
      `${productName} organizes model SEO around reusable model configuration. New model pages should come from data, not copied components.`,
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
