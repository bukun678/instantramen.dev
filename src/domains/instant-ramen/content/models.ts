import { instantRamenBrandConfig } from '../config/brand';
import type {
  InstantRamenModelAvailability,
  InstantRamenModelConfig,
  InstantRamenModelStatus,
  InstantRamenProviderStatus,
  InstantRamenSupportedMode,
} from './types';

const productName = instantRamenBrandConfig.productName;

function modelSeo({
  slug,
  title,
  description,
  keywords,
}: {
  slug: string;
  title: string;
  description: string;
  keywords: string;
}) {
  return {
    title,
    description,
    canonical: `/models/${slug}`,
    keywords,
    openGraph: {
      title,
      description,
      imagePath: instantRamenBrandConfig.previewImagePath,
      imageAlt: instantRamenBrandConfig.openGraph.imageAlt,
      type: 'website' as const,
    },
    noIndex: false,
  };
}

function buildModel({
  slug,
  name,
  displayName,
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
  useCases,
  faq,
  supportedModes,
  creditCost,
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
  useCases: InstantRamenModelConfig['useCases'];
  faq: InstantRamenModelConfig['faq'];
  supportedModes: InstantRamenSupportedMode[];
  creditCost: number;
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
    description:
      `${description} ${productName} presents this model inside a multi-model AI image generation platform, not as an official single-model website.`,
    heroTitle,
    heroDescription,
    features,
    strengths,
    limitations,
    bestFor,
    useCases,
    faq,
    supportedModes,
    aspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    creditCost,
    seo: modelSeo({
      slug,
      title: seoTitle,
      description: seoDescription,
      keywords,
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
    provider: 'instant-ramen',
    providerModelId: 'instant-ramen-image',
    providerStatus: 'planned',
    status: 'coming-soon',
    allowGeneration: false,
    showInGenerator: true,
    shortDescription:
      'The planned flagship image model slot for the Instant Ramen product.',
    description:
      'Instant Ramen is reserved as the future flagship model for image generation and editing workflows.',
    heroTitle: 'Instant Ramen Model for future AI image workflows',
    heroDescription:
      'The Instant Ramen model is coming soon and will sit beside other providers in the same creator workspace.',
    features: [
      'Reserved for Text to Image and Image Editing',
      'Designed for future provider capability mapping',
      'Built to work with credits, history, and prompt reuse',
    ],
    strengths: [
      'Ownable product positioning',
      'Clear roadmap slot for future differentiation',
      'Fits the broader Instant Ramen model marketplace',
    ],
    limitations: [
      'Not publicly available yet',
      'No real provider execution is connected in this phase',
      'Quality and pricing will be finalized later',
    ],
    bestFor: [
      'Future Instant Ramen native generation',
      'Brand-led image workflows',
      'Long-term SEO and product differentiation',
    ],
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
          'Not yet. This model page is a coming-soon SEO and product slot inside the multi-model platform.',
      },
      {
        question: 'Is this the whole website?',
        answer:
          `No. ${productName} is a multi-model AI image generation platform, and Instant Ramen is one model slot within it.`,
      },
    ],
    supportedModes: ['text-to-image', 'image-to-image', 'image-editing'],
    creditCost: 10,
    seoTitle: 'Instant Ramen AI Image Model',
    seoDescription:
      'Learn about the coming soon Instant Ramen image model inside a multi-model AI image generation platform.',
    keywords:
      'Instant Ramen model, AI image model, multi-model AI image generation platform',
    supportsImageInput: true,
    supportsMaskInput: true,
    supportsNegativePrompt: false,
  }),
  buildModel({
    slug: 'gpt-image-2',
    name: 'gpt-image-2',
    displayName: 'GPT Image 2',
    provider: 'openai',
    providerModelId: 'gpt-image-2',
    status: 'available',
    providerStatus: 'configured',
    allowGeneration: true,
    showInGenerator: true,
    shortDescription:
      'A premium image model option for generation, editing, and high-fidelity visual iteration.',
    description:
      'GPT Image 2 is positioned as a premium model option for precise image generation and editing.',
    heroTitle: 'GPT Image 2 for high-fidelity AI image creation',
    heroDescription:
      `Use GPT Image 2 through ${productName} as one provider option inside a multi-model creator workflow.`,
    features: [
      'Text to Image workflows',
      'Image to Image and editing-ready positioning',
      'Premium model slot for detailed outputs',
    ],
    strengths: [
      'Strong general-purpose image understanding',
      'Useful for precise prompt following',
      'Fits premium creator workflows',
    ],
    limitations: [
      'Provider availability may change',
      'Final quality and pricing depend on integration details',
      'Not an official OpenAI website',
    ],
    bestFor: [
      'High-fidelity concept generation',
      'Precise visual iteration',
      'Creator and marketing assets',
    ],
    useCases: [
      {
        title: 'Campaign visuals',
        description:
          'Generate polished visual directions for ads, landing pages, and launch assets.',
      },
      {
        title: 'Image editing',
        description:
          'Prepare source-image workflows where prompt following matters.',
      },
    ],
    faq: [
      {
        question: `Is ${productName} the official GPT Image 2 website?`,
        answer:
          `No. ${productName} is an independent multi-model AI image generation platform that can present GPT Image 2 as one model option.`,
      },
      {
        question: 'Can GPT Image 2 be used for editing?',
        answer:
          'The model page reserves Image Editing and Image to Image positioning; real provider execution comes later.',
      },
    ],
    supportedModes: ['text-to-image', 'image-to-image', 'image-editing'],
    creditCost: 8,
    seoTitle: 'GPT Image 2 AI Image Model',
    seoDescription:
      'Explore GPT Image 2 as an available model inside Instant Ramen, a multi-model AI image generation platform.',
    keywords:
      'GPT Image 2, OpenAI image model, AI image generation, AI image editing',
    supportsImageInput: true,
    supportsMaskInput: true,
    supportsNegativePrompt: false,
  }),
  buildModel({
    slug: 'nano-banana',
    name: 'nano-banana',
    displayName: 'Nano Banana',
    provider: 'nano-banana',
    providerModelId: 'nano-banana-image',
    status: 'available',
    providerStatus: 'configured',
    allowGeneration: true,
    showInGenerator: true,
    shortDescription:
      'A fast image model option for prompt-driven generation and creative iteration.',
    description:
      'Nano Banana is treated as one available model option for image generation and editing workflows.',
    heroTitle: 'Nano Banana for fast AI image generation',
    heroDescription:
      `Use Nano Banana inside ${productName} without making the whole product a single-model site.`,
    features: [
      'Prompt driven Text to Image',
      'Creative iteration workflows',
      'Model page ready for future provider execution',
    ],
    strengths: [
      'Fast creative exploration',
      'Good fit for trend-driven search demand',
      'Useful as one model in a broader provider catalog',
    ],
    limitations: [
      'Not the only model in Instant Ramen',
      'Provider behavior must be validated during integration',
      'Exact generation limits are not finalized in this phase',
    ],
    bestFor: [
      'Quick creative drafts',
      'Social content ideas',
      'Prompt experimentation',
    ],
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
        question: 'Is Instant Ramen just a Nano Banana website?',
        answer:
          `No. Nano Banana is one available model inside ${productName}, a multi-model AI image generation platform.`,
      },
      {
        question: 'Does this page call Nano Banana now?',
        answer:
          'No. This phase creates the SEO model framework only; provider execution is added later.',
      },
    ],
    supportedModes: ['text-to-image', 'image-to-image', 'image-editing'],
    creditCost: 4,
    seoTitle: 'Nano Banana AI Image Model',
    seoDescription:
      'Explore Nano Banana as an available image model inside Instant Ramen for multi-model AI image generation workflows.',
    keywords:
      'Nano Banana, Nano Banana AI, AI image model, AI image generator',
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
    heroDescription:
      `Explore FLUX as one available model option in ${productName}'s multi-model AI image generation platform.`,
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
        answer:
          `No. ${productName} is a multi-model AI image generation platform, not an official model website.`,
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
    heroDescription:
      `Explore Imagen as one provider-backed option inside ${productName}'s multi-model platform.`,
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
    bestFor: ['Text-to-image searchers', 'Quality comparisons', 'Creative assets'],
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
        answer:
          `No. ${productName} is an independent multi-model AI image generation platform.`,
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
    heroDescription:
      `Explore Recraft inside ${productName} as a model option for brand and product creative work.`,
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
        answer:
          `No. Recraft is one available model in ${productName}'s multi-model AI image generation platform.`,
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
    heroDescription:
      `Explore Ideogram as one available model in ${productName}'s provider-ready image platform.`,
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
        answer:
          `No. ${productName} is a multi-model AI image generation platform that can list Ideogram as one model option.`,
      },
      {
        question: 'Can Ideogram be compared with GPT Image 2 or Nano Banana?',
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

export const availableInstantRamenModels = instantRamenModels.filter(
  (model) => model.status === 'available'
);

export const comingSoonInstantRamenModels = instantRamenModels.filter(
  (model) => model.status === 'coming-soon'
);

export const generationEnabledInstantRamenModels = instantRamenModels.filter(
  (model) =>
    model.enabled &&
    model.visible &&
    model.availability === 'available' &&
    model.allowGeneration
);

export function getInstantRamenGeneratorEntryModels() {
  return instantRamenModels.filter(
    (model) => model.enabled && model.visible && model.showInGenerator
  );
}

export function getInstantRamenModelBySlug(slug: string) {
  return instantRamenModels.find((model) => model.slug === slug);
}
