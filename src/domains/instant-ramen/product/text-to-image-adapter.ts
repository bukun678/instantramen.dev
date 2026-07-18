import { getInstantRamenModelBySlug } from '../content';
import {
  generateAPImartImage,
  queryAPImartTask,
  type APIMartImageSize,
} from './apimart-provider';
import { getInstantRamenGenerationModelProvider } from './model-provider-map';
import type { InstantRamenGenerationMode } from './text-to-image';

export type InstantRamenTextToImageRequest = {
  mode?: InstantRamenGenerationMode;
  prompt: string;
  model: string;
  shipAnyUserId?: string;
  size?: string;
  inputImageUrl?: string;
};

export type InstantRamenTextToImageResult = {
  imageUrl: string | null;
  mode: InstantRamenGenerationMode;
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

export class InstantRamenTextToImageError extends Error {
  constructor(
    public readonly code:
      | 'prompt_required'
      | 'prompt_too_long'
      | 'invalid_mode'
      | 'invalid_model'
      | 'invalid_parameter'
      | 'invalid_task'
      | 'task_not_found'
      | 'forbidden'
      | 'input_image_required'
      | 'input_image_not_allowed'
      | 'insufficient_credits'
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

export function normalizeInstantRamenGenerationMode(
  mode?: string | null
): InstantRamenGenerationMode {
  if (!mode || mode === 'text-to-image') {
    return 'text-to-image';
  }

  if (mode === 'image-to-image') {
    return mode;
  }

  throw new InstantRamenTextToImageError(
    'invalid_mode',
    'Invalid generation mode.',
    400
  );
}

function normalizeAPIMartSize(size?: string): APIMartImageSize {
  if (!size) {
    return '16:9';
  }

  const value = instantRamenTextToImageSizes.find(
    (option) => option.value === size
  )?.value;

  if (!value) {
    throw new InstantRamenTextToImageError(
      'invalid_parameter',
      'Invalid output aspect ratio.',
      400
    );
  }

  return value;
}

function getGenerationContext({
  mode,
  model,
}: {
  mode: InstantRamenGenerationMode;
  model: string;
}) {
  const catalogModel = getInstantRamenModelBySlug(model);

  if (catalogModel?.availability === 'coming-soon') {
    throw new InstantRamenTextToImageError(
      'coming_soon',
      `${catalogModel.displayName} is coming soon and cannot generate images yet.`,
      409
    );
  }

  const providerMapping = getInstantRamenGenerationModelProvider(model);

  if (!catalogModel || !providerMapping?.allowGeneration) {
    throw new InstantRamenTextToImageError(
      'invalid_model',
      'This model is not available in the generation entry.',
      400
    );
  }

  if (
    !providerMapping.supportedModes.includes(mode) ||
    (mode === 'image-to-image' &&
      (!catalogModel.capabilities.supportsImageInput ||
        !providerMapping.imageInput))
  ) {
    throw new InstantRamenTextToImageError(
      'invalid_model',
      `${catalogModel.displayName} does not support ${mode}.`,
      400
    );
  }

  const creditCost = providerMapping.modeCreditCosts[mode];
  if (!Number.isInteger(creditCost) || Number(creditCost) <= 0) {
    throw new InstantRamenTextToImageError(
      'invalid_model',
      `${catalogModel.displayName} does not have a configured credit cost for ${mode}.`,
      409
    );
  }

  return {
    catalogModel,
    creditCost: Number(creditCost),
    providerMapping,
  };
}

export function getInstantRamenGenerationCreditCost({
  mode,
  model,
}: {
  mode: InstantRamenGenerationMode;
  model: string;
}) {
  return getGenerationContext({ mode, model }).creditCost;
}

function requireSafeInputImageUrl(inputImageUrl?: string) {
  if (!inputImageUrl) {
    throw new InstantRamenTextToImageError(
      'input_image_required',
      'Upload a reference image before generating.',
      400
    );
  }

  try {
    const url = new URL(inputImageUrl);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error('Unsupported image URL protocol.');
    }
    return url.toString();
  } catch {
    throw new InstantRamenTextToImageError(
      'input_image_not_allowed',
      'The uploaded image reference is invalid.',
      400
    );
  }
}

export function validateInstantRamenGenerationRequest({
  mode: requestedMode,
  prompt,
  model,
  size,
  inputImageUrl,
}: InstantRamenTextToImageRequest) {
  const mode = normalizeInstantRamenGenerationMode(requestedMode);
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    throw new InstantRamenTextToImageError(
      'prompt_required',
      'Prompt is required.',
      400
    );
  }

  if (trimmedPrompt.length > 2000) {
    throw new InstantRamenTextToImageError(
      'prompt_too_long',
      'Prompt must be 2,000 characters or fewer.',
      400
    );
  }

  const context = getGenerationContext({ mode, model });
  const normalizedSize = normalizeAPIMartSize(size);
  const normalizedInputImageUrl =
    mode === 'image-to-image'
      ? requireSafeInputImageUrl(inputImageUrl)
      : undefined;

  if (!process.env.APIMART_API_KEY) {
    throw new InstantRamenTextToImageError(
      'provider_not_configured',
      `${context.catalogModel.displayName} is available, but its provider is not configured yet.`,
      503
    );
  }

  if (context.providerMapping.provider !== 'apimart') {
    throw new InstantRamenTextToImageError(
      'provider_not_configured',
      `${context.catalogModel.displayName} does not have an APImart provider mapping.`,
      503
    );
  }

  return {
    ...context,
    inputImageUrl: normalizedInputImageUrl,
    mode,
    prompt: trimmedPrompt,
    size: normalizedSize,
  };
}

export async function generateInstantRamenTextToImage({
  mode: requestedMode,
  prompt,
  model,
  size,
  inputImageUrl,
}: InstantRamenTextToImageRequest): Promise<InstantRamenTextToImageResult> {
  const validated = validateInstantRamenGenerationRequest({
    mode: requestedMode,
    prompt,
    model,
    size,
    inputImageUrl,
  });

  try {
    const result = await generateAPImartImage({
      imageUrls: validated.inputImageUrl
        ? [validated.inputImageUrl]
        : undefined,
      model: validated.providerMapping,
      prompt: validated.prompt,
      size: validated.size,
    });

    return {
      imageUrl: result.imageUrl,
      mode: validated.mode,
      model: validated.catalogModel.slug,
      provider: validated.providerMapping.provider,
      providerModelId: validated.providerMapping.providerModelId,
      status: result.status,
      taskId: result.taskId,
      mock: false,
    };
  } catch (error) {
    throw new InstantRamenTextToImageError(
      'provider_request_failed',
      error instanceof Error
        ? error.message
        : 'APImart image generation failed.',
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
