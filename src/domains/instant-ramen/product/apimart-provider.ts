import type { InstantRamenGenerationModelProvider } from './model-provider-map';

export const APIMART_BASE_URL = 'https://api.apimart.ai/v1';
export const APIMART_IMAGES_GENERATIONS_URL = `${APIMART_BASE_URL}/images/generations`;
export const APIMART_TASKS_URL = `${APIMART_BASE_URL}/tasks`;

export type APIMartImageGenerationResult = {
  imageUrl: string | null;
  rawResponse: unknown;
  status: 'pending';
  taskId: string;
};

export type APIMartTaskStatusResult = {
  imageUrl: string | null;
  rawResponse: unknown;
  status: 'pending' | 'succeeded' | 'failed';
  taskId: string;
};

export type APIMartImageSize = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

type APIMartGenerateImageInput = {
  apiKey?: string;
  fetcher?: typeof fetch;
  googleSearch?: boolean;
  imageUrls?: string[];
  model: InstantRamenGenerationModelProvider;
  officialFallback?: boolean;
  prompt: string;
  size?: APIMartImageSize;
};

type APIMartQueryTaskInput = {
  apiKey?: string;
  fetcher?: typeof fetch;
  taskId: string;
};

function getAPIMartSubmittedTaskId(payload: any) {
  const firstTask = Array.isArray(payload?.data) ? payload.data[0] : undefined;

  if (typeof firstTask?.task_id === 'string' && firstTask.task_id) {
    return firstTask.task_id;
  }

  return null;
}

function getAPIMartTaskImageUrl(payload: any) {
  const firstImage = payload?.data?.result?.images?.[0];
  const firstUrl = Array.isArray(firstImage?.url)
    ? firstImage.url[0]
    : undefined;

  if (typeof firstUrl === 'string' && firstUrl) {
    return firstUrl;
  }

  return null;
}

function getAPIMartTaskStatus(payload: any): APIMartTaskStatusResult['status'] {
  const status = payload?.data?.status;

  if (status === 'completed') {
    return 'succeeded';
  }

  if (status === 'failed') {
    return 'failed';
  }

  return 'pending';
}

function buildAPIMartGenerationBody({
  googleSearch,
  imageUrls,
  model,
  officialFallback,
  prompt,
  size,
}: {
  googleSearch?: boolean;
  imageUrls?: string[];
  model: InstantRamenGenerationModelProvider;
  officialFallback?: boolean;
  prompt: string;
  size: APIMartImageSize;
}) {
  const body: Record<string, unknown> = {
    model: model.providerModelId,
    prompt,
    size,
    resolution:
      model.providerModelId === 'gemini-3.1-flash-image-preview' ? '2K' : '2k',
    n: 1,
  };

  if (model.providerModelId === 'gpt-image-2-official') {
    body.quality = 'high';
  }

  if (imageUrls?.length) {
    body.image_urls = imageUrls;
  }

  if (typeof googleSearch === 'boolean') {
    body.google_search = googleSearch;
  }

  if (typeof officialFallback === 'boolean') {
    body.official_fallback = officialFallback;
  }

  return body;
}

async function readAPIMartPayload(response: Response) {
  const rawText = await response.text();

  return rawText ? JSON.parse(rawText) : {};
}

function getAPIMartErrorMessage(payload: any, status: number) {
  return typeof payload?.error?.message === 'string'
    ? payload.error.message
    : typeof payload?.message === 'string'
      ? payload.message
      : `APImart request failed with status ${status}.`;
}

export async function generateAPImartImage({
  apiKey = process.env.APIMART_API_KEY,
  fetcher = fetch,
  googleSearch,
  imageUrls,
  model,
  officialFallback,
  prompt,
  size = '16:9',
}: APIMartGenerateImageInput): Promise<APIMartImageGenerationResult> {
  if (!apiKey) {
    throw new Error('APIMART_API_KEY is required.');
  }

  const body = buildAPIMartGenerationBody({
    googleSearch,
    imageUrls,
    model,
    officialFallback,
    prompt,
    size,
  });

  const response = await fetcher(APIMART_IMAGES_GENERATIONS_URL, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const payload = await readAPIMartPayload(response);

  if (!response.ok) {
    throw new Error(getAPIMartErrorMessage(payload, response.status));
  }

  const taskId = getAPIMartSubmittedTaskId(payload);

  if (taskId) {
    return {
      imageUrl: null,
      rawResponse: payload,
      status: 'pending',
      taskId,
    };
  }

  throw new Error('APImart response did not include data[0].task_id.');
}

export async function queryAPImartTask({
  apiKey = process.env.APIMART_API_KEY,
  fetcher = fetch,
  taskId,
}: APIMartQueryTaskInput): Promise<APIMartTaskStatusResult> {
  if (!apiKey) {
    throw new Error('APIMART_API_KEY is required.');
  }

  const response = await fetcher(`${APIMART_TASKS_URL}/${taskId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    method: 'GET',
  });

  const payload = await readAPIMartPayload(response);

  if (!response.ok) {
    throw new Error(getAPIMartErrorMessage(payload, response.status));
  }

  const status = getAPIMartTaskStatus(payload);

  if (status === 'succeeded') {
    return {
      imageUrl: getAPIMartTaskImageUrl(payload),
      rawResponse: payload,
      status: 'succeeded',
      taskId,
    };
  }

  return {
    imageUrl: null,
    rawResponse: payload,
    status,
    taskId,
  };
}
