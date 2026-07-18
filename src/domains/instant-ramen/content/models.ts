import { instantRamenBrandConfig } from '../config/brand';
import { getInstantRamenModelArtwork } from './artwork';
import type {
  InstantRamenModelAvailability,
  InstantRamenModelConfig,
  InstantRamenModelStatus,
  InstantRamenProviderStatus,
  InstantRamenSupportedMode,
} from './types';

const productName = instantRamenBrandConfig.productName;

export const instantRamenImageToImageInputPolicy = {
  acceptedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  maxBytes: 10 * 1024 * 1024,
  maxImages: 1,
} as const;

function modelSeo({
  slug,
  title,
  description,
  keywords,
  indexable,
}: {
  slug: string;
  title: string;
  description: string;
  keywords: string;
  indexable: boolean;
}) {
  return {
    title,
    description,
    canonical: `/models/${slug}`,
    keywords,
    openGraph: {
      title,
      description,
      imagePath: getInstantRamenModelArtwork(slug)[0].src,
      imageAlt: getInstantRamenModelArtwork(slug)[0].alt,
      type: 'website' as const,
    },
    noIndex: !indexable,
  };
}

function buildModel({
  slug,
  name,
  displayName,
  sortOrder = 999,
  featured = false,
  recommended = false,
  defaultSelected = false,
  indexable = false,
  provider,
  providerModelId,
  providerStatus = 'planned',
  status,
  availability = status,
  enabled = true,
  visible = true,
  allowGeneration = false,
  showInGenerator = false,
  shortDescription,
  description,
  heroTitle,
  heroDescription,
  features,
  strengths,
  limitations,
  bestFor,
  howTo,
  difference,
  useCases,
  faq,
  supportedModes,
  creditCost,
  modeCreditCosts,
  imageInput,
  seoTitle,
  seoDescription,
  keywords,
  supportsImageInput,
  supportsMaskInput,
  supportsNegativePrompt,
}: {
  slug: string;
  name: string;
  displayName: string;
  sortOrder?: number;
  featured?: boolean;
  recommended?: boolean;
  defaultSelected?: boolean;
  indexable?: boolean;
  provider: string;
  providerModelId: string;
  providerStatus?: InstantRamenProviderStatus;
  status: InstantRamenModelStatus;
  availability?: InstantRamenModelAvailability;
  enabled?: boolean;
  visible?: boolean;
  allowGeneration?: boolean;
  showInGenerator?: boolean;
  shortDescription: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  features: string[];
  strengths: string[];
  limitations: string[];
  bestFor: string[];
  howTo?: InstantRamenModelConfig['howTo'];
  difference?: string;
  useCases: InstantRamenModelConfig['useCases'];
  faq: InstantRamenModelConfig['faq'];
  supportedModes: InstantRamenSupportedMode[];
  creditCost: number;
  modeCreditCosts?: Partial<Record<InstantRamenSupportedMode, number>>;
  imageInput?: InstantRamenModelConfig['imageInput'];
  seoTitle: string;
  seoDescription: string;
  keywords: string;
  supportsImageInput: boolean;
  supportsMaskInput: boolean;
  supportsNegativePrompt: boolean;
}): InstantRamenModelConfig {
  return {
    slug,
    name,
    displayName,
    sortOrder,
    featured,
    recommended,
    defaultSelected,
    indexable,
    provider,
    providerModelId,
    providerStatus,
    status,
    availability,
    enabled,
    visible,
    allowGeneration,
    showInGenerator,
    shortDescription,
    description,
    heroTitle,
    heroDescription,
    features,
    strengths,
    limitations,
    bestFor,
    howTo: howTo ?? [
      {
        title: 'Write a prompt',
        description:
          'Describe the subject, composition, mood, and visual style.',
      },
      {
        title: 'Choose the model',
        description: `Select ${displayName} when it is available in the generator.`,
      },
      {
        title: 'Generate and review',
        description:
          'Create the image, review the result, and download it when ready.',
      },
    ],
    difference:
      difference ??
      `${displayName} is one option in ${productName}, a multi-model AI image generation platform.`,
    useCases,
    faq,
    supportedModes,
    aspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    creditCost,
    modeCreditCosts: modeCreditCosts ?? { 'text-to-image': creditCost },
    imageInput,
    seo: modelSeo({
      slug,
      title: seoTitle,
      description: seoDescription,
      keywords,
      indexable,
    }),
    seoTitle,
    seoDescription,
    capabilities: {
      executionMode: status === 'coming-soon' ? 'planned' : 'async',
      supportsPrompt: true,
      supportsImageInput,
      supportsMaskInput,
      supportsSeed: false,
      supportsNegativePrompt,
    },
  };
}

export const instantRamenModels: InstantRamenModelConfig[] = [
  buildModel({
    slug: 'instant-ramen',
    name: 'instant-ramen',
    displayName: 'Instant Ramen',
    sortOrder: 3,
    featured: false,
    recommended: false,
    defaultSelected: false,
    indexable: true,
    provider: 'instant-ramen',
    providerModelId: 'instant-ramen-image',
    providerStatus: 'planned',
    status: 'coming-soon',
    allowGeneration: false,
    showInGenerator: true,
    shortDescription:
      'A future first-party image model concept for the Instant Ramen workspace.',
    description:
      'Instant Ramen is the planned first-party AI image model for this workspace. It is not available for generation yet, so this page documents the product direction without presenting concept artwork as model output.',
    heroTitle: 'Instant Ramen AI Image Model',
    heroDescription:
      'Instant Ramen is coming soon. Explore the concept, then create today with GPT Image 2 or Nano Banana 2.',
    features: [
      'Planned text-to-image workflow',
      'Future model-specific capability mapping',
      'Designed to join the same generator and history flow',
    ],
    strengths: [
      'A clear first-party product direction',
      'One shared workspace instead of another separate tool',
      'A roadmap for future model-specific experiences',
    ],
    limitations: [
      'Not publicly available yet',
      'Concept previews are not generated by the Instant Ramen model',
      'Capabilities, quality, pricing, and launch timing are not announced',
    ],
    bestFor: [
      'Following the Instant Ramen model roadmap',
      'Understanding the planned product direction',
      'Finding available alternatives while the model is in development',
    ],
    howTo: [
      {
        title: 'Explore the concept',
        description:
          'Review the planned role of the Instant Ramen model and its concept previews.',
      },
      {
        title: 'Create with an available model',
        description:
          'Use GPT Image 2 or Nano Banana 2 in the current text-to-image generator.',
      },
      {
        title: 'Return for launch updates',
        description:
          'The generator will enable Instant Ramen only after the model is actually available.',
      },
    ],
    difference:
      'Unlike GPT Image 2 and Nano Banana 2, Instant Ramen is a planned first-party model and cannot generate images today. Its examples are labeled as concepts, not model results.',
    useCases: [
      {
        title: 'Native Instant Ramen generation',
        description:
          'Reserve a clear page for the future first-party model without blocking current provider pages.',
      },
      {
        title: 'Image editing roadmap',
        description:
          'Prepare messaging for prompt-based editing and image to image flows.',
      },
    ],
    faq: [
      {
        question: 'Is the Instant Ramen model available now?',
        answer:
          'No. The Instant Ramen model is marked Coming Soon and cannot be selected for generation.',
      },
      {
        question: 'Are the images on this page generated by Instant Ramen?',
        answer:
          'No. They are clearly labeled concept previews or creative examples because the model is not available.',
      },
      {
        question: 'What can I use while Instant Ramen is coming soon?',
        answer:
          'You can generate images now with GPT Image 2 or Nano Banana 2 from the same Instant Ramen generator.',
      },
      {
        question: 'Will Instant Ramen replace the other models?',
        answer: `The plan is to keep ${productName} as a multi-model AI image generation platform, with the first-party model joining other useful options.`,
      },
    ],
    supportedModes: ['text-to-image'],
    creditCost: 10,
    seoTitle: 'Instant Ramen AI Image Model',
    seoDescription:
      'Explore the coming soon Instant Ramen AI image model, see concept previews, and use available image generators while it is in development.',
    keywords:
      'Instant Ramen AI, Instant Ramen image generator, Instant Ramen AI model, coming soon AI image model',
    supportsImageInput: false,
    supportsMaskInput: false,
    supportsNegativePrompt: false,
  }),
  buildModel({
    slug: 'gpt-image-2',
    name: 'gpt-image-2',
    displayName: 'GPT Image 2',
    sortOrder: 1,
    featured: true,
    recommended: true,
    defaultSelected: true,
    indexable: true,
    provider: 'apimart',
    providerModelId: 'gpt-image-2',
    status: 'available',
    providerStatus: 'configured',
    allowGeneration: true,
    showInGenerator: true,
    shortDescription:
      'An image model for detailed prompts, reference-led transformations, and polished visual iteration.',
    description:
      'GPT Image 2 is available in Instant Ramen for text-to-image and single-reference image-to-image generation. Write a prompt, choose an aspect ratio, and follow the generation task until the image is ready to download.',
    heroTitle: 'GPT Image 2 Generator',
    heroDescription:
      'Create detailed AI images from text prompts with GPT Image 2, multiple aspect ratios, and a focused workflow from generation to download.',
    features: [
      'Text-to-image generation from natural-language prompts',
      'Prompt-guided transformation from one reference image',
      'Square, portrait, landscape, and vertical aspect ratios',
    ],
    strengths: [
      'Suited to prompts with multiple visual details',
      'Useful for polished product and editorial concepts',
      'A focused option for deliberate visual iteration',
    ],
    limitations: [
      'The first image-to-image version accepts one reference image without masks or local edits',
      'Results can vary between generations and prompts',
      'Generation uses credits and depends on provider availability',
    ],
    bestFor: [
      'High-fidelity concept generation',
      'Precise visual iteration',
      'Creator and marketing assets',
    ],
    howTo: [
      {
        title: 'Describe the image',
        description:
          'Include the subject, composition, lighting, material, mood, and camera direction you want.',
      },
      {
        title: 'Choose GPT Image 2',
        description:
          'Select GPT Image 2 and pick the aspect ratio that matches the intended use.',
      },
      {
        title: 'Generate and download',
        description:
          'Start the task, wait for the result panel to finish, then download the generated image.',
      },
    ],
    difference:
      'GPT Image 2 is the recommended default when you want a deliberate, detail-rich prompt workflow. Nano Banana 2 is positioned as the faster option for broad creative iteration.',
    useCases: [
      {
        title: 'Campaign visuals',
        description:
          'Generate polished visual directions for ads, landing pages, and launch assets.',
      },
      {
        title: 'Editorial concepts',
        description:
          'Explore detailed scenes, feature imagery, and art direction from a written brief.',
      },
    ],
    faq: [
      {
        question: 'What is GPT Image 2?',
        answer: `GPT Image 2 is an available text-to-image model in ${productName}. It turns written prompts into image generation tasks and downloadable results.`,
      },
      {
        question: 'How do I use the GPT Image 2 generator?',
        answer:
          'Open the generator, choose GPT Image 2, enter a prompt, select an aspect ratio, and start generation.',
      },
      {
        question: 'Does the current GPT Image 2 flow support image editing?',
        answer:
          'Yes. Image to Image accepts one PNG, JPEG, or WebP reference and a prompt for whole-image transformation. Masks and local inpainting are not included in this MVP.',
      },
      {
        question: `Is ${productName} the official GPT Image 2 website?`,
        answer: `No. ${productName} is an independent multi-model AI image generation platform that offers GPT Image 2 as one model option.`,
      },
    ],
    supportedModes: ['text-to-image', 'image-to-image'],
    creditCost: 8,
    modeCreditCosts: {
      'text-to-image': 8,
      'image-to-image': 8,
    },
    imageInput: instantRamenImageToImageInputPolicy,
    seoTitle: 'GPT Image 2 Generator Online',
    seoDescription:
      'Use the GPT Image 2 generator online for prompt-driven AI images, multiple aspect ratios, task status, and downloadable results.',
    keywords:
      'GPT Image 2 generator, GPT Image 2 image generator, GPT Image 2 online, AI image generation',
    supportsImageInput: true,
    supportsMaskInput: false,
    supportsNegativePrompt: false,
  }),
  buildModel({
    slug: 'nano-banana',
    name: 'nano-banana',
    displayName: 'Nano Banana 2',
    sortOrder: 2,
    featured: true,
    recommended: false,
    defaultSelected: false,
    indexable: true,
    provider: 'apimart',
    providerModelId: 'gemini-3.1-flash-image-preview',
    status: 'available',
    providerStatus: 'configured',
    allowGeneration: true,
    showInGenerator: true,
    shortDescription:
      'A fast option for prompt creation, reference-led transformations, and quick visual iterations.',
    description:
      'Nano Banana 2 is available in Instant Ramen for text-to-image and single-reference image-to-image generation. It gives creators a direct way to explore ideas, transform a reference, and download finished results.',
    heroTitle: 'Nano Banana 2 Generator',
    heroDescription:
      'Create expressive AI images from text prompts with Nano Banana 2 for fast creative exploration and visual iteration.',
    features: [
      'Text-to-image generation from a written prompt',
      'Prompt-guided transformation from one reference image',
      'Multiple aspect ratios for common creative formats',
    ],
    strengths: [
      'Suited to quick creative exploration',
      'Useful for testing varied visual directions',
      'A practical option for lightweight prompt iteration',
    ],
    limitations: [
      'The first image-to-image version accepts one reference image without masks or local edits',
      'Results depend on prompt clarity and may vary',
      'Generation uses credits and depends on provider availability',
    ],
    bestFor: [
      'Quick creative drafts',
      'Social content ideas',
      'Prompt experimentation',
    ],
    howTo: [
      {
        title: 'Start with one clear idea',
        description:
          'Describe the subject, visual style, mood, and composition in a concise prompt.',
      },
      {
        title: 'Choose Nano Banana 2',
        description:
          'Select Nano Banana 2 and choose the aspect ratio for your intended canvas.',
      },
      {
        title: 'Generate, compare, and save',
        description:
          'Create the image, refine the prompt when needed, and download the result you want to keep.',
      },
    ],
    difference:
      'Nano Banana 2 is positioned for fast creative exploration and style variation. GPT Image 2 is the default option for more deliberate, detail-heavy prompt work.',
    useCases: [
      {
        title: 'Thumbnail exploration',
        description:
          'Try multiple prompt directions for covers and social images.',
      },
      {
        title: 'Style variations',
        description:
          'Explore visual styles before committing to a final provider or output.',
      },
    ],
    faq: [
      {
        question: 'What is Nano Banana 2?',
        answer: `Nano Banana 2 is an available AI image model in ${productName} for turning text prompts into generated images.`,
      },
      {
        question: 'How do I use the Nano Banana image generator?',
        answer:
          'Open the generator, choose Nano Banana 2, write a prompt, select an aspect ratio, and start generation.',
      },
      {
        question: 'Can I download Nano Banana 2 results?',
        answer:
          'Yes. A download action appears after the task returns a completed image.',
      },
      {
        question: 'Is Instant Ramen a single-model Nano Banana website?',
        answer: `No. Nano Banana 2 is one available option inside ${productName}, alongside GPT Image 2 and the coming-soon Instant Ramen model.`,
      },
    ],
    supportedModes: ['text-to-image', 'image-to-image'],
    creditCost: 4,
    modeCreditCosts: {
      'text-to-image': 4,
      'image-to-image': 4,
    },
    imageInput: instantRamenImageToImageInputPolicy,
    seoTitle: 'Nano Banana 2 AI Image Generator Online',
    seoDescription:
      'Use Nano Banana 2 online for fast prompt-driven AI image generation, multiple aspect ratios, result previews, and downloads.',
    keywords:
      'Nano Banana AI, Nano Banana image generator, Nano Banana online, Nano Banana 2, AI image generator',
    supportsImageInput: true,
    supportsMaskInput: false,
    supportsNegativePrompt: false,
  }),
  buildModel({
    slug: 'flux',
    name: 'flux',
    displayName: 'FLUX',
    provider: 'black-forest-labs',
    providerModelId: 'flux',
    status: 'available',
    shortDescription:
      'A popular model family for high-quality prompt-based image generation.',
    description:
      'FLUX is positioned as an available model family for high-quality prompt-first image generation.',
    heroTitle: 'FLUX for high-quality AI image generation',
    heroDescription: `Explore FLUX as one available model option in ${productName}'s multi-model AI image generation platform.`,
    features: [
      'Prompt-first image generation',
      'Strong visual style exploration',
      'Available model page for future provider selection',
    ],
    strengths: [
      'High-quality visual outputs',
      'Useful for creative direction',
      'Well-known model search demand',
    ],
    limitations: [
      'Specific provider variant is not finalized',
      'Editing capabilities depend on integration',
      'Not an official FLUX website',
    ],
    bestFor: ['Concept art', 'Marketing visuals', 'Creative exploration'],
    useCases: [
      {
        title: 'Concept visuals',
        description:
          'Generate expressive scenes and style directions from detailed prompts.',
      },
      {
        title: 'Brand exploration',
        description:
          'Test visual mood, lighting, and composition before production.',
      },
    ],
    faq: [
      {
        question: 'Is FLUX available as part of Instant Ramen?',
        answer:
          'This framework marks FLUX as an available model page. Real provider execution will be wired later.',
      },
      {
        question: 'Is this an official FLUX page?',
        answer: `No. ${productName} is a multi-model AI image generation platform, not an official model website.`,
      },
    ],
    supportedModes: ['text-to-image', 'image-to-image'],
    creditCost: 5,
    seoTitle: 'FLUX AI Image Model',
    seoDescription:
      'Explore FLUX as an available model inside Instant Ramen for multi-model AI image generation.',
    keywords: 'FLUX AI, FLUX image model, AI image generation model',
    supportsImageInput: true,
    supportsMaskInput: false,
    supportsNegativePrompt: true,
  }),
  buildModel({
    slug: 'imagen',
    name: 'imagen',
    displayName: 'Imagen',
    provider: 'google',
    providerModelId: 'imagen',
    status: 'available',
    shortDescription:
      'A model family associated with high-quality text-to-image generation.',
    description:
      'Imagen is positioned as an available model option for high-quality image generation search intent.',
    heroTitle: 'Imagen for text-to-image generation',
    heroDescription: `Explore Imagen as one provider-backed option inside ${productName}'s multi-model platform.`,
    features: [
      'Text to Image positioning',
      'Provider-ready model metadata',
      'Useful comparison target for future SEO pages',
    ],
    strengths: [
      'Strong model awareness',
      'Good fit for text-to-image queries',
      'Useful for quality-oriented workflows',
    ],
    limitations: [
      'Specific API details are not connected in this phase',
      'Editing behavior depends on provider capability',
      'Not an official Google website',
    ],
    bestFor: [
      'Text-to-image searchers',
      'Quality comparisons',
      'Creative assets',
    ],
    useCases: [
      {
        title: 'Search-driven generation',
        description:
          'Cover users looking for Imagen-style AI image generation inside a broader platform.',
      },
      {
        title: 'Model comparison',
        description:
          'Prepare Imagen for future compare pages against other image models.',
      },
    ],
    faq: [
      {
        question: 'Is Instant Ramen an official Imagen website?',
        answer: `No. ${productName} is an independent multi-model AI image generation platform.`,
      },
      {
        question: 'Can Imagen be compared with other models?',
        answer:
          'Yes. Phase 7 reserves compare data so future pages can compare Imagen with other models.',
      },
    ],
    supportedModes: ['text-to-image'],
    creditCost: 6,
    seoTitle: 'Imagen AI Image Model',
    seoDescription:
      'Explore Imagen as an available model inside Instant Ramen, a multi-model AI image generation platform.',
    keywords: 'Imagen AI, Imagen image generator, AI image model',
    supportsImageInput: false,
    supportsMaskInput: false,
    supportsNegativePrompt: false,
  }),
  buildModel({
    slug: 'recraft',
    name: 'recraft',
    displayName: 'Recraft',
    provider: 'recraft',
    providerModelId: 'recraft',
    status: 'available',
    shortDescription:
      'A design-oriented image model option for brand, product, and graphic workflows.',
    description:
      'Recraft is positioned as an available model for design-friendly image generation and brand asset workflows.',
    heroTitle: 'Recraft for design-focused AI image generation',
    heroDescription: `Explore Recraft inside ${productName} as a model option for brand and product creative work.`,
    features: [
      'Design-oriented model positioning',
      'Useful for product and brand assets',
      'Ready for future provider-specific capability mapping',
    ],
    strengths: [
      'Good fit for graphic and commercial use cases',
      'Useful for brand exploration',
      'Strong candidate for comparison pages',
    ],
    limitations: [
      'Provider execution is not connected in this phase',
      'Exact editing modes depend on integration',
      'Not an official Recraft website',
    ],
    bestFor: ['Brand graphics', 'Product visuals', 'Commercial creative'],
    useCases: [
      {
        title: 'Brand assets',
        description:
          'Generate visual directions for logos, graphics, and campaign design systems.',
      },
      {
        title: 'Product mockups',
        description:
          'Explore product presentation styles and commercial image directions.',
      },
    ],
    faq: [
      {
        question: 'Is Recraft the only model here?',
        answer: `No. Recraft is one available model in ${productName}'s multi-model AI image generation platform.`,
      },
      {
        question: 'Does Recraft support editing here today?',
        answer:
          'The page reserves provider capability fields. Real editing execution comes later.',
      },
    ],
    supportedModes: ['text-to-image', 'image-to-image'],
    creditCost: 5,
    seoTitle: 'Recraft AI Image Model',
    seoDescription:
      'Explore Recraft as an available model inside Instant Ramen for design-focused AI image generation.',
    keywords: 'Recraft AI, Recraft image model, AI design generator',
    supportsImageInput: true,
    supportsMaskInput: false,
    supportsNegativePrompt: false,
  }),
  buildModel({
    slug: 'ideogram',
    name: 'ideogram',
    displayName: 'Ideogram',
    provider: 'ideogram',
    providerModelId: 'ideogram',
    status: 'available',
    shortDescription:
      'A model option known for creative image generation and typography-oriented prompts.',
    description:
      'Ideogram is positioned as an available model for creative generation and text-aware image workflows.',
    heroTitle: 'Ideogram for creative AI image generation',
    heroDescription: `Explore Ideogram as one available model in ${productName}'s provider-ready image platform.`,
    features: [
      'Creative image generation positioning',
      'Useful for typography-oriented creative prompts',
      'Ready for future model comparisons',
    ],
    strengths: [
      'Strong model awareness among creators',
      'Useful for posters and social graphics',
      'Good candidate for SEO comparison pages',
    ],
    limitations: [
      'Provider execution is not connected yet',
      'Exact typography behavior must be validated later',
      'Not an official Ideogram website',
    ],
    bestFor: ['Posters', 'Social graphics', 'Creative typography concepts'],
    useCases: [
      {
        title: 'Poster concepts',
        description:
          'Generate image directions for posters, campaigns, and graphic compositions.',
      },
      {
        title: 'Social graphics',
        description:
          'Explore visual concepts that may include text-aware creative direction.',
      },
    ],
    faq: [
      {
        question: 'Is this an official Ideogram website?',
        answer: `No. ${productName} is a multi-model AI image generation platform that can list Ideogram as one model option.`,
      },
      {
        question: 'Can Ideogram be compared with GPT Image 2 or Nano Banana 2?',
        answer:
          'Yes. The compare framework is reserved so future pages can compare model strengths and use cases.',
      },
    ],
    supportedModes: ['text-to-image'],
    creditCost: 5,
    seoTitle: 'Ideogram AI Image Model',
    seoDescription:
      'Explore Ideogram as an available model inside Instant Ramen, a multi-model AI image generation platform.',
    keywords: 'Ideogram AI, Ideogram image model, AI poster generator',
    supportsImageInput: false,
    supportsMaskInput: false,
    supportsNegativePrompt: false,
  }),
];

function sortInstantRamenModels(models: InstantRamenModelConfig[]) {
  return [...models].sort((left, right) => left.sortOrder - right.sortOrder);
}

export const visibleInstantRamenModels = sortInstantRamenModels(
  instantRamenModels.filter((model) => model.visible && model.indexable)
);

export const availableInstantRamenModels = visibleInstantRamenModels.filter(
  (model) => model.status === 'available'
);

export const comingSoonInstantRamenModels = visibleInstantRamenModels.filter(
  (model) => model.status === 'coming-soon'
);

export const generationEnabledInstantRamenModels = sortInstantRamenModels(
  instantRamenModels.filter(
    (model) =>
      model.enabled &&
      model.visible &&
      model.availability === 'available' &&
      model.allowGeneration
  )
);

export function getInstantRamenGeneratorEntryModels() {
  return sortInstantRamenModels(
    instantRamenModels.filter(
      (model) => model.enabled && model.visible && model.showInGenerator
    )
  );
}

export function getDefaultInstantRamenGenerationModel() {
  return (
    generationEnabledInstantRamenModels.find(
      (model) => model.defaultSelected
    ) ?? generationEnabledInstantRamenModels[0]
  );
}

export function getInstantRamenModelBySlug(slug: string) {
  return instantRamenModels.find((model) => model.slug === slug);
}
