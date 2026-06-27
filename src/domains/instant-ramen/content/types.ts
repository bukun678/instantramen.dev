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
    title: string;
    description: string;
  }>;
};

export type InstantRamenModelStatus =
  | 'available'
  | 'preview'
  | 'coming-soon';

export type InstantRamenProviderStatus =
  | 'configured'
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
  displayName: string;
  provider: string;
  providerModelId: string;
  providerStatus: InstantRamenProviderStatus;
  status: InstantRamenModelStatus;
  description: string;
  supportedModes: InstantRamenSupportedMode[];
  aspectRatios: InstantRamenAspectRatio[];
  creditCost: number;
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
