import { getInstantRamenModelBySlug } from '../content';
import {
  generateAPImartImage,
  queryAPImartTask,
  type APIMartImageSize,
} from './apimart-provider';
import { getInstantRamenGenerationModelProvider } from './model-provider-map';
import { getInstantRamenTextToImageMvpModel } from './text-to-image';

export type InstantRamenTextToImageRequest = {
  prompt: string;
  model: string;
  shipAnyUserId?: string;
  size?: string;
};

export type InstantRamenTextToImageResult = {
  imageUrl: string | null;
  model: string;
  provider: string;
  providerModelId: string;
  status: 'pending' | 'succeeded';
  taskId?: string;
  mock: false;
};

export type InstantRamenTextToImageTaskResult = {
  imageUrl: string | null;
  status: 'pending' | 'succeeded' | 'failed';
  taskId: string;
};

export const instantRamenTextToImageSizes: Array<{
  label: string;
  value: APIMartImageSize;
}> = [
  { label: 'Square 1:1', value: '1:1' },
  { label: 'Portrait 3:4', value: '3:4' },
  { label: 'Landscape 4:3', value: '4:3' },
  { label: 'Vertical 9:16', value: '9:16' },
  { label: 'Wide 16:9', value: '16:9' },
];

function normalizeAPIMartSize(size?: string): APIMartImageSize {
  const value = instantRamenTextToImageSizes.find(
    (option) => option.value === size
  )?.value;

  return value ?? '16:9';
}

export class InstantRamenTextToImageError extends Error {
  constructor(
    public readonly code:
      | 'prompt_required'
      | 'invalid_model'
      | 'invalid_task'
      | 'coming_soon'
      | 'provider_not_configured'
      | 'provider_request_failed',
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
  size,
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

  if (!process.env.APIMART_API_KEY) {
    throw new InstantRamenTextToImageError(
      'provider_not_configured',
      `${selectedModel.label} is available, but its provider is not configured yet.`,
      503
    );
  }

  if (providerMapping.provider !== 'apimart') {
    throw new InstantRamenTextToImageError(
      'provider_not_configured',
      `${selectedModel.label} does not have an APImart provider mapping.`,
      503
    );
  }

  try {
    const result = await generateAPImartImage({
      model: providerMapping,
      prompt: trimmedPrompt,
      size: normalizeAPIMartSize(size),
    });

    return {
      imageUrl: result.imageUrl,
      model: selectedModel.slug,
      provider: providerMapping.provider,
      providerModelId: providerMapping.providerModelId,
      status: result.status,
      taskId: result.taskId,
      mock: false,
    };
  } catch (error) {
    throw new InstantRamenTextToImageError(
      'provider_request_failed',
      error instanceof Error ? error.message : 'APImart image generation failed.',
      502
    );
  }
}

export async function queryInstantRamenTextToImageTask({
  taskId,
}: {
  taskId: string;
}): Promise<InstantRamenTextToImageTaskResult> {
  const trimmedTaskId = taskId.trim();

  if (!trimmedTaskId) {
    throw new InstantRamenTextToImageError(
      'invalid_task',
      'Task ID is required.',
      400
    );
  }

  if (!process.env.APIMART_API_KEY) {
    throw new InstantRamenTextToImageError(
      'provider_not_configured',
      'APImart provider is not configured yet.',
      503
    );
  }

  try {
    const result = await queryAPImartTask({
      taskId: trimmedTaskId,
    });

    return {
      imageUrl: result.imageUrl,
      status: result.status,
      taskId: result.taskId,
    };
  } catch (error) {
    throw new InstantRamenTextToImageError(
      'provider_request_failed',
      error instanceof Error ? error.message : 'APImart task query failed.',
      502
    );
  }
}
