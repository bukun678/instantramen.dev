import { getInstantRamenModelBySlug } from '../content';
import { getInstantRamenGenerationModelProvider } from './model-provider-map';
import { getInstantRamenTextToImageMvpModel } from './text-to-image';

export type InstantRamenTextToImageRequest = {
  prompt: string;
  model: string;
  shipAnyUserId?: string;
};

export type InstantRamenTextToImageResult = {
  imageUrl: string | null;
  model: string;
  provider: string;
  providerModelId: string;
  status: 'provider_not_configured';
  mock: false;
};

export class InstantRamenTextToImageError extends Error {
  constructor(
    public readonly code:
      | 'prompt_required'
      | 'invalid_model'
      | 'coming_soon'
      | 'provider_not_configured',
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'InstantRamenTextToImageError';
  }
}

export async function generateInstantRamenTextToImage({
  prompt,
  model,
}: InstantRamenTextToImageRequest): Promise<InstantRamenTextToImageResult> {
  const trimmedPrompt = prompt.trim();
  const selectedModel = getInstantRamenTextToImageMvpModel(model);

  if (!trimmedPrompt) {
    throw new InstantRamenTextToImageError(
      'prompt_required',
      'Prompt is required.',
      400
    );
  }

  if (!selectedModel) {
    const catalogModel = getInstantRamenModelBySlug(model);

    if (catalogModel?.availability === 'coming-soon') {
      throw new InstantRamenTextToImageError(
        'coming_soon',
        `${catalogModel.displayName} is coming soon and cannot generate images yet.`,
        409
      );
    }

    throw new InstantRamenTextToImageError(
      'invalid_model',
      'Invalid model.',
      400
    );
  }

  const providerMapping = getInstantRamenGenerationModelProvider(
    selectedModel.slug
  );

  if (!providerMapping?.allowGeneration) {
    throw new InstantRamenTextToImageError(
      'invalid_model',
      'This model is not available in the generation entry.',
      400
    );
  }

  if (providerMapping.providerStatus === 'not-configured') {
    throw new InstantRamenTextToImageError(
      'provider_not_configured',
      `${selectedModel.label} is available, but its provider is not configured yet.`,
      503
    );
  }

  return {
    imageUrl: null,
    model: selectedModel.slug,
    provider: providerMapping.provider,
    providerModelId: providerMapping.providerModelId,
    status: 'provider_not_configured',
    mock: false,
  };
}
