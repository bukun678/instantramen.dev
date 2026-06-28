import type {
  InstantRamenRouteKey,
  InstantRamenRouteKind,
} from '../config/routes';

export type InstantRamenOpenGraphConfig = {
  title: string;
  description: string;
  imagePath: string;
  imageAlt: string;
  type: 'website';
};

export type InstantRamenPageSeoConfig = {
  title: string;
  description: string;
  canonical: string;
  keywords: string;
  openGraph: InstantRamenOpenGraphConfig;
  noIndex: boolean;
};

export type InstantRamenPageContentConfig = {
  routeKey: InstantRamenRouteKey;
  kind: InstantRamenRouteKind;
  seo: InstantRamenPageSeoConfig;
  eyebrow?: string;
  headline: string;
  summary: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  sections?: Array<{
    id: string;
    label?: string;
    title: string;
    description: string;
    items?: Array<{
      title: string;
      description: string;
      badge?: string;
      href?: string;
    }>;
    steps?: Array<{
      title: string;
      description: string;
    }>;
    faq?: Array<{
      question: string;
      answer: string;
    }>;
    cta?: {
      label: string;
      href: string;
    };
  }>;
};

export type InstantRamenModelStatus =
  | 'available'
  | 'coming-soon';

export type InstantRamenModelAvailability =
  | 'available'
  | 'coming-soon';

export type InstantRamenProviderStatus =
  | 'configured'
  | 'not-configured'
  | 'planned'
  | 'placeholder';

export type InstantRamenSupportedMode =
  | 'text-to-image'
  | 'image-to-image'
  | 'image-editing';

export type InstantRamenAspectRatio =
  | '1:1'
  | '3:4'
  | '4:3'
  | '9:16'
  | '16:9';

export type InstantRamenModelConfig = {
  slug: string;
  name: string;
  provider: string;
  displayName: string;
  providerModelId: string;
  providerStatus: InstantRamenProviderStatus;
  status: InstantRamenModelStatus;
  availability: InstantRamenModelAvailability;
  enabled: boolean;
  visible: boolean;
  allowGeneration: boolean;
  showInGenerator: boolean;
  shortDescription: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  features: string[];
  strengths: string[];
  limitations: string[];
  bestFor: string[];
  useCases: Array<{
    title: string;
    description: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  supportedModes: InstantRamenSupportedMode[];
  aspectRatios: InstantRamenAspectRatio[];
  creditCost: number;
  seo: InstantRamenPageSeoConfig;
  seoTitle: string;
  seoDescription: string;
  capabilities: {
    executionMode: 'sync' | 'async' | 'planned';
    supportsPrompt: boolean;
    supportsImageInput: boolean;
    supportsMaskInput: boolean;
    supportsSeed: boolean;
    supportsNegativePrompt: boolean;
  };
  providerOptions?: Record<string, string | number | boolean>;
};

export type InstantRamenModelComparisonStatus =
  | 'planned'
  | 'draft'
  | 'published';

export type InstantRamenModelComparisonConfig = {
  slug: string;
  leftModel: string;
  rightModel: string;
  status: InstantRamenModelComparisonStatus;
  seo: InstantRamenPageSeoConfig;
};
