import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  generateInstantRamenTextToImage,
  getInstantRamenGenerationModelProvider,
  InstantRamenTextToImageError,
} from '../src/domains/instant-ramen';
import {
  APIMART_IMAGES_GENERATIONS_URL,
  APIMART_TASKS_URL,
  generateAPImartImage,
  queryAPImartTask,
} from '../src/domains/instant-ramen/product/apimart-provider';

const projectRoot = process.cwd();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8');
}

async function expectProviderNotConfigured(model: string) {
  const originalKey = process.env.APIMART_API_KEY;
  delete process.env.APIMART_API_KEY;

  try {
    await generateInstantRamenTextToImage({
      model,
      prompt: 'A clean APImart verification prompt',
      shipAnyUserId: 'verify-user',
    });
  } catch (error) {
    process.env.APIMART_API_KEY = originalKey;
    assert(
      error instanceof InstantRamenTextToImageError,
      `${model} must fail with InstantRamenTextToImageError when APIMART_API_KEY is missing.`
    );
    assert(
      error.code === 'provider_not_configured',
      `${model} must fail with provider_not_configured when APIMART_API_KEY is missing.`
    );
    return;
  }

  process.env.APIMART_API_KEY = originalKey;
  throw new Error(`${model} must not generate without APIMART_API_KEY.`);
}

async function verifyAPImartRequest({
  expectedProviderModelId,
  expectedQuality,
  expectedResolution,
  slug,
}: {
  expectedProviderModelId: string;
  expectedQuality?: string;
  expectedResolution: string;
  slug: string;
}) {
  const mapping = getInstantRamenGenerationModelProvider(slug);
  assert(mapping, `${slug} must have an APImart mapping.`);
  assert(mapping.provider === 'apimart', `${slug} must use APImart provider.`);
  assert(
    mapping.providerModelId === expectedProviderModelId,
    `${slug} must map to ${expectedProviderModelId}.`
  );
  assert(mapping.providerStatus === 'configured', `${slug} must be configured.`);

  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;

  const result = await generateAPImartImage({
    apiKey: 'verify-token',
    fetcher: async (url, init) => {
      capturedUrl = String(url);
      capturedInit = init;

      return new Response(
        JSON.stringify({
          data: [
            {
              status: 'submitted',
              task_id: `task_${slug}`,
            },
          ],
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      );
    },
    model: mapping,
    prompt: 'A clean APImart verification prompt',
  });

  assert(
    capturedUrl === APIMART_IMAGES_GENERATIONS_URL,
    'APImart provider must call the official images generations endpoint.'
  );
  assert(
    capturedInit?.method === 'POST',
    'APImart provider must use POST for image generations.'
  );
  assert(
    (capturedInit?.headers as Record<string, string>)?.Authorization ===
      'Bearer verify-token',
    'APImart provider must send Authorization: Bearer <token>.'
  );

  const body = JSON.parse(String(capturedInit?.body));

  assert(body.model === expectedProviderModelId, `${slug} request model mismatch.`);
  assert(
    body.prompt === 'A clean APImart verification prompt',
    `${slug} request prompt mismatch.`
  );
  assert(body.size === '16:9', `${slug} must request official size 16:9.`);
  assert(
    body.resolution === expectedResolution,
    `${slug} must request official resolution ${expectedResolution}.`
  );
  assert(
    body.quality === expectedQuality,
    expectedQuality
      ? `${slug} must request official quality ${expectedQuality}.`
      : `${slug} must not send quality in the MVP request.`
  );
  assert(body.n === 1, `${slug} must request n = 1.`);
  assert(result.status === 'pending', `${slug} fake response must be pending.`);
  assert(
    result.taskId === `task_${slug}`,
    `${slug} fake response task ID mismatch.`
  );
}

async function verifyOfficialTaskQuery() {
  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;

  const result = await queryAPImartTask({
    apiKey: 'verify-token',
    fetcher: async (url, init) => {
      capturedUrl = String(url);
      capturedInit = init;

      return new Response(
        JSON.stringify({
          code: 200,
          data: {
            id: 'task_123',
            status: 'completed',
            progress: 100,
            result: {
              images: [
                {
                  url: ['https://upload.apimart.ai/f/image/result.png'],
                  expires_at: 1776928569,
                },
              ],
            },
          },
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      );
    },
    taskId: 'task_123',
  });

  assert(
    capturedUrl === `${APIMART_TASKS_URL}/task_123`,
    'APImart task query must use the official GET /v1/tasks/{task_id} endpoint.'
  );
  assert(capturedInit?.method === 'GET', 'APImart task query must use GET.');
  assert(
    (capturedInit?.headers as Record<string, string>)?.Authorization ===
      'Bearer verify-token',
    'APImart task query must send Authorization: Bearer <token>.'
  );
  assert(result.status === 'succeeded', 'completed task must be succeeded.');
  assert(
    result.imageUrl === 'https://upload.apimart.ai/f/image/result.png',
    'task query must read data.result.images[0].url[0].'
  );
}

async function verifyProviderErrorSanitization() {
  const mapping = getInstantRamenGenerationModelProvider('gpt-image-2');
  assert(mapping, 'gpt-image-2 must have an APImart mapping.');

  try {
    await generateAPImartImage({
      apiKey: 'verify-token',
      fetcher: async () =>
        new Response(
          JSON.stringify({
            message:
              '[sk-Yqt***1b4] API key quota exhausted !token.UnlimitedQuota && token.RemainQuota = 0 (request id: verify-request)',
          }),
          {
            headers: {
              'Content-Type': 'application/json',
            },
            status: 429,
          }
        ),
      model: mapping,
      prompt: 'A clean APImart verification prompt',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert(
      !message.includes('sk-'),
      'APImart provider errors must not expose API key fragments.'
    );
    assert(
      message.includes('API key quota exhausted'),
      'APimart provider errors must preserve the real provider error reason.'
    );
    assert(
      message.includes('verify-request'),
      'APImart provider errors must preserve request IDs for debugging.'
    );
    return;
  }

  throw new Error('APImart error sanitization must throw provider errors.');
}

async function main() {
  await expectProviderNotConfigured('gpt-image-2');
  await expectProviderNotConfigured('nano-banana');

  await verifyAPImartRequest({
    expectedProviderModelId: 'gpt-image-2-official',
    expectedQuality: 'high',
    expectedResolution: '2k',
    slug: 'gpt-image-2',
  });
  await verifyAPImartRequest({
    expectedProviderModelId: 'gemini-3.1-flash-image-preview',
    expectedResolution: '2K',
    slug: 'nano-banana',
  });
  await verifyOfficialTaskQuery();
  await verifyProviderErrorSanitization();

  const apiRoute = read('src/app/api/instant-ramen/text-to-image/route.ts');
  const adapter = read(
    'src/domains/instant-ramen/product/text-to-image-adapter.ts'
  );

  assert(
    !apiRoute.includes('api.apimart.ai'),
    'APImart URL must stay inside the provider adapter, not the API route.'
  );
  assert(
    adapter.includes('generateAPImartImage'),
    'Text-to-image adapter must call the APImart provider adapter.'
  );

  console.log('Instant Ramen APImart provider verified.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
