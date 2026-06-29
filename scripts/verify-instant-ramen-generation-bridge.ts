import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  generateInstantRamenTextToImage,
  getInstantRamenGenerationModelProvider,
  getInstantRamenTextToImageMvpModel,
  InstantRamenTextToImageError,
  instantRamenGenerationModelProviders,
} from '../src/domains/instant-ramen';

const projectRoot = process.cwd();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8');
}

const requiredGenerationModels = ['gpt-image-2', 'nano-banana'];

async function expectTextToImageError({
  code,
  model,
}: {
  code: InstantRamenTextToImageError['code'];
  model: string;
}) {
  const originalKey = process.env.APIMART_API_KEY;
  delete process.env.APIMART_API_KEY;

  try {
    await generateInstantRamenTextToImage({
      model,
      prompt: 'A clean MVP test prompt',
      shipAnyUserId: 'verify-user',
    });
  } catch (error) {
    process.env.APIMART_API_KEY = originalKey;
    assert(
      error instanceof InstantRamenTextToImageError,
      `${model} must fail with an InstantRamenTextToImageError.`
    );
    assert(
      error.code === code,
      `${model} must fail with ${code}, received ${error.code}.`
    );
    return;
  }

  process.env.APIMART_API_KEY = originalKey;
  throw new Error(`${model} must not return a generated image in this phase.`);
}

async function main() {
  assert(
    instantRamenGenerationModelProviders.length === 2,
    'Generation provider map must contain exactly GPT Image 2 and Nano Banana.'
  );

  for (const slug of requiredGenerationModels) {
    const model = getInstantRamenTextToImageMvpModel(slug);
    const provider = getInstantRamenGenerationModelProvider(slug);

    assert(model, `${slug} must remain in the MVP generation model list.`);
    assert(provider, `${slug} must have a generation provider mapping.`);
    assert(provider.allowGeneration, `${slug} must allow generation.`);
    assert(provider.provider === 'apimart', `${slug} must use APImart.`);
    assert(
      provider.providerStatus === 'configured',
      `${slug} provider map must be configured for APImart.`
    );
    assert(
      provider.executionStatus === 'ready',
      `${slug} execution status must be ready.`
    );
    assert(
      provider.apiKeyEnvName === 'APIMART_API_KEY',
      `${slug} must use APIMART_API_KEY.`
    );
  }

  await expectTextToImageError({
    code: 'provider_not_configured',
    model: 'gpt-image-2',
  });
  await expectTextToImageError({
    code: 'provider_not_configured',
    model: 'nano-banana',
  });
  await expectTextToImageError({
    code: 'coming_soon',
    model: 'instant-ramen',
  });

  assert(
    !getInstantRamenGenerationModelProvider('instant-ramen')?.allowGeneration,
    'Instant Ramen coming-soon model must not be executable.'
  );
  assert(
    !getInstantRamenGenerationModelProvider('flux'),
    'Non-MVP models must not be exposed in the primary generation provider map.'
  );

  const apiRoute = read('src/app/api/instant-ramen/text-to-image/route.ts');
  const adapter = read(
    'src/domains/instant-ramen/product/text-to-image-adapter.ts'
  );
  const bridge = read(
    'src/domains/instant-ramen/server/supabase-user-bridge.ts'
  );

  assert(
    apiRoute.includes('createInstantRamenSupabaseServerClient'),
    'Text-to-image API must validate Supabase session server-side.'
  );
  assert(
    apiRoute.includes('401'),
    'Text-to-image API must return 401 for unauthenticated requests.'
  );
  assert(
    adapter.includes('provider_not_configured'),
    'Text-to-image adapter must return provider_not_configured for pending providers.'
  );
  assert(
    adapter.includes('coming_soon'),
    'Text-to-image adapter must reject coming-soon models clearly.'
  );
  assert(
    !adapter.includes('data:image/svg+xml'),
    'Text-to-image adapter must no longer return mock SVG data URLs.'
  );
  assert(
    bridge.includes('grantCreditsForNewUser'),
    'Supabase to ShipAny bridge must reserve initial credits grant logic.'
  );

  console.log('Instant Ramen generation bridge skeleton verified.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
