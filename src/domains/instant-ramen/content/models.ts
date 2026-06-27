import type { InstantRamenModelConfig } from './types';

export const instantRamenModels: InstantRamenModelConfig[] = [
  {
    slug: 'instant-ramen',
    name: 'instant-ramen',
    displayName: 'Instant Ramen',
    provider: 'instant-ramen',
    providerModelId: 'instant-ramen-image',
    providerStatus: 'planned',
    status: 'coming-soon',
    description:
      'The planned Instant Ramen image model, reserved as the flagship model for the product.',
    supportedModes: ['text-to-image', 'image-to-image', 'image-editing'],
    aspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    creditCost: 10,
    seoTitle: 'Instant Ramen Model',
    seoDescription:
      'Learn about the upcoming Instant Ramen image model for multi-model AI image generation and editing.',
    capabilities: {
      executionMode: 'planned',
      supportsPrompt: true,
      supportsImageInput: true,
      supportsMaskInput: true,
      supportsSeed: false,
      supportsNegativePrompt: false,
    },
  },
  {
    slug: 'nano-banana',
    name: 'nano-banana',
    displayName: 'Nano Banana',
    provider: 'nano-banana',
    providerModelId: 'nano-banana-image',
    providerStatus: 'planned',
    status: 'preview',
    description:
      'A fast and versatile image model option reserved for generation and editing workflows.',
    supportedModes: ['text-to-image', 'image-to-image', 'image-editing'],
    aspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    creditCost: 4,
    seoTitle: 'Nano Banana AI Image Model',
    seoDescription:
      'Use Nano Banana through Instant Ramen as part of a multi-model AI image generation and editing workflow.',
    capabilities: {
      executionMode: 'async',
      supportsPrompt: true,
      supportsImageInput: true,
      supportsMaskInput: false,
      supportsSeed: false,
      supportsNegativePrompt: false,
    },
  },
  {
    slug: 'gpt-image-2',
    name: 'gpt-image-2',
    displayName: 'GPT Image 2',
    provider: 'openai',
    providerModelId: 'gpt-image-2',
    providerStatus: 'planned',
    status: 'preview',
    description:
      'A premium image model option reserved for precise generation and high-fidelity editing.',
    supportedModes: ['text-to-image', 'image-to-image', 'image-editing'],
    aspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
    creditCost: 8,
    seoTitle: 'GPT Image 2 AI Image Model',
    seoDescription:
      'Use GPT Image 2 through Instant Ramen for AI image generation, editing, and visual iteration workflows.',
    capabilities: {
      executionMode: 'async',
      supportsPrompt: true,
      supportsImageInput: true,
      supportsMaskInput: true,
      supportsSeed: false,
      supportsNegativePrompt: false,
    },
  },
];

export function getInstantRamenModelBySlug(slug: string) {
  return instantRamenModels.find((model) => model.slug === slug);
}
