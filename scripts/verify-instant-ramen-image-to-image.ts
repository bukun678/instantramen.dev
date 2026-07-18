import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  getInstantRamenGenerationModelProvider,
  getInstantRamenModelBySlug,
  validateInstantRamenGenerationRequest,
} from '../src/domains/instant-ramen';
import { generateAPImartImage } from '../src/domains/instant-ramen/product/apimart-provider';
import {
  createInstantRamenInputImageKey,
  InstantRamenInputImageError,
  resolveInstantRamenInputImageUrl,
  validateInstantRamenInputImage,
  validateOwnedInstantRamenInputImageKey,
} from '../src/domains/instant-ramen/product/input-image';

const projectRoot = process.cwd();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8');
}

async function verifyProviderImageInput(slug: string) {
  const mapping = getInstantRamenGenerationModelProvider(slug);
  assert(mapping, `${slug} must have an APImart mapping.`);

  let capturedInit: RequestInit | undefined;
  await generateAPImartImage({
    apiKey: 'verify-token',
    fetcher: async (_url, init) => {
      capturedInit = init;
      return new Response(
        JSON.stringify({ data: [{ task_id: `task_${slug}` }] }),
        { status: 200 }
      );
    },
    imageUrls: ['https://assets.example.com/input.webp'],
    model: mapping,
    prompt: 'Transform this image into a watercolor illustration.',
  });

  const body = JSON.parse(String(capturedInit?.body));
  assert(
    Array.isArray(body.image_urls) &&
      body.image_urls[0] === 'https://assets.example.com/input.webp',
    `${slug} must map the reference image to APImart image_urls.`
  );
}

async function verifyInputImageSecurity() {
  const pngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  const detected = validateInstantRamenInputImage({
    bytes: pngBytes,
    claimedMimeType: 'image/png',
  });
  assert(detected.mimeType === 'image/png', 'PNG bytes must be detected.');

  try {
    validateInstantRamenInputImage({
      bytes: pngBytes,
      claimedMimeType: 'image/jpeg',
    });
    throw new Error('MIME mismatch must be rejected.');
  } catch (error) {
    assert(
      error instanceof InstantRamenInputImageError &&
        error.code === 'input_image_type_mismatch',
      'Claimed MIME must match the real image signature.'
    );
  }

  const key = createInstantRamenInputImageKey({
    extension: 'png',
    randomId: '123e4567-e89b-42d3-a456-426614174000',
    userId: 'user_123',
  });
  assert(
    key ===
      'instant-ramen/input-images/user_123/123e4567-e89b-42d3-a456-426614174000.png',
    'Input key must use a user-owned, random namespace.'
  );
  assert(
    validateOwnedInstantRamenInputImageKey({ key, userId: 'user_123' }) === key,
    'The owner must be able to resolve their input key.'
  );

  try {
    validateOwnedInstantRamenInputImageKey({ key, userId: 'user_456' });
    throw new Error('Cross-user input key must be rejected.');
  } catch (error) {
    assert(
      error instanceof InstantRamenInputImageError &&
        error.code === 'invalid_input_image',
      'Cross-user input references must be rejected.'
    );
  }

  const resolvedUrl = await resolveInstantRamenInputImageUrl({
    key,
    storage: {
      exists: async () => true,
      getPublicUrl: () => 'https://assets.example.com/reference.png',
    },
    userId: 'user_123',
  });
  assert(
    resolvedUrl === 'https://assets.example.com/reference.png',
    'Owned storage keys must resolve to their storage URL.'
  );
}

function verifyGenerationContract() {
  const originalKey = process.env.APIMART_API_KEY;
  process.env.APIMART_API_KEY = 'verify-token';

  try {
    for (const model of ['gpt-image-2', 'nano-banana']) {
      const validated = validateInstantRamenGenerationRequest({
        inputImageUrl: 'https://assets.example.com/reference.png',
        mode: 'image-to-image',
        model,
        prompt: 'Keep the product unchanged and create a studio background.',
        size: '1:1',
      });
      assert(validated.mode === 'image-to-image', `${model} mode mismatch.`);
      assert(
        validated.inputImageUrl === 'https://assets.example.com/reference.png',
        `${model} must keep the server-resolved input URL.`
      );
      assert(
        validated.creditCost === getInstantRamenModelBySlug(model)?.creditCost,
        `${model} must use its server-side configured credit cost.`
      );
    }
  } finally {
    if (originalKey === undefined) {
      delete process.env.APIMART_API_KEY;
    } else {
      process.env.APIMART_API_KEY = originalKey;
    }
  }
}

async function main() {
  await verifyInputImageSecurity();
  verifyGenerationContract();

  for (const slug of ['gpt-image-2', 'nano-banana']) {
    const model = getInstantRamenModelBySlug(slug) as any;
    assert(model, `${slug} must exist in unified model config.`);
    assert(
      model.supportedModes.includes('image-to-image'),
      `${slug} must advertise image-to-image in unified model config.`
    );
    assert(
      model.capabilities.supportsImageInput,
      `${slug} must advertise image input support.`
    );
    assert(
      model.imageInput?.maxBytes === 10 * 1024 * 1024,
      `${slug} must use the verified 10 MB shared input limit.`
    );
    assert(
      model.imageInput?.acceptedMimeTypes?.join(',') ===
        'image/png,image/jpeg,image/webp',
      `${slug} must accept only PNG, JPEG, and WebP in the MVP.`
    );
    assert(
      model.modeCreditCosts?.['image-to-image'] === model.creditCost,
      `${slug} image-to-image credits must come from unified config.`
    );
    await verifyProviderImageInput(slug);
  }

  const plannedModel = getInstantRamenModelBySlug('instant-ramen') as any;
  assert(
    !plannedModel?.supportedModes.includes('image-to-image'),
    'Instant Ramen coming-soon model must not enable image-to-image.'
  );

  const requiredFiles = [
    'src/domains/instant-ramen/product/input-image.ts',
    'src/app/api/instant-ramen/input-image/route.ts',
  ];
  for (const path of requiredFiles) {
    assert(existsSync(join(projectRoot, path)), `Missing ${path}.`);
  }

  const inputValidation = read(
    'src/domains/instant-ramen/product/input-image.ts'
  );
  for (const phrase of [
    'image/png',
    'image/jpeg',
    'image/webp',
    '10 * 1024 * 1024',
    'isSupportedInstantRamenImageBytes',
    'instant-ramen/input-images/',
  ]) {
    assert(
      inputValidation.includes(phrase),
      `Input image validation must include ${phrase}.`
    );
  }

  const uploadRoute = read('src/app/api/instant-ramen/input-image/route.ts');
  for (const phrase of [
    'createInstantRamenSupabaseServerClient',
    'getOrCreateInstantRamenShipAnyUser',
    'getStorageService',
    'uploadInstantRamenInputImage',
  ]) {
    assert(
      uploadRoute.includes(phrase),
      `Upload route must include ${phrase}.`
    );
  }
  assert(
    !uploadRoute.includes('console.log'),
    'Upload route must not log user image metadata or URLs.'
  );
  assert(
    uploadRoute.includes('readRequestBodyWithinLimit') &&
      uploadRoute.includes('request.body.getReader()') &&
      uploadRoute.includes('INPUT_IMAGE_MULTIPART_MAX_BYTES'),
    'Upload route must enforce its body limit even without Content-Length.'
  );

  const uploader = read('src/shared/blocks/common/image-uploader.tsx');
  assert(
    !uploader.includes("console.error('Upload failed"),
    'Uploader must not log user upload details.'
  );
  assert(
    uploader.includes(
      'const files = Array.from(event.dataTransfer?.files || []);'
    ),
    'Dropped files must reach central validation so unsupported formats show an error.'
  );
  assert(
    uploader.includes('onError={() => handlePreviewError(item.id)}'),
    'Broken uploaded previews must become an explicit error state.'
  );
  assert(
    !uploader.includes('tabIndex={disabled ? -1 : 0}'),
    'Uploader wrapper must not create a non-actionable keyboard focus stop.'
  );
  for (const phrase of [
    "presentation?: 'tiles' | 'dropzone'",
    "presentation === 'dropzone'",
    'Upload reference image',
    'Click or drag one image here',
    "'image/webp': 'WebP'",
    '· Max {maxSizeMB}MB',
    '>Replace<',
    '>Remove<',
  ]) {
    assert(
      uploader.includes(phrase),
      `The integrated upload area must include ${phrase}.`
    );
  }

  const generationRoute = read(
    'src/app/api/instant-ramen/text-to-image/route.ts'
  );
  for (const phrase of [
    'mode',
    'inputImageKey',
    'requestId',
    'createAITask',
    'findAITaskById',
    'updateAITaskById',
    'getRemainingCredits',
  ]) {
    assert(
      generationRoute.includes(phrase),
      `Unified generation route must include ${phrase}.`
    );
  }

  const component = read(
    'src/domains/instant-ramen/components/text-to-image-mvp.tsx'
  );
  assert(
    component.includes('Boolean(option.imageInput)') &&
      component.includes(
        "typeof option.modeCreditCosts['image-to-image'] === 'number'"
      ),
    'Image-to-image models must require a configured input policy and mode credit cost.'
  );
  assert(
    !component.includes('inputPolicy?.acceptedMimeTypes ??'),
    'Image input formats must not fall back to a component-local policy.'
  );
  assert(
    component.includes('presentation="dropzone"') &&
      !component.includes('bg-background rounded-xl border border-dashed p-4'),
    'The generator must use one integrated dropzone instead of a frame containing a smaller upload tile.'
  );
  for (const forbiddenThemeToken of [
    'bg-black',
    'bg-[#',
    'text-white',
    'border-white',
  ]) {
    assert(
      !component.includes(forbiddenThemeToken),
      `The generator must not hard-code the dark-only token ${forbiddenThemeToken}.`
    );
  }
  assert(
    component.includes('data-product-result-panel') &&
      component.includes('bg-muted/25') &&
      component.includes('data-product-result-canvas') &&
      component.includes('bg-background/65'),
    'The result panel must use the Instant Ramen semantic theme hierarchy.'
  );
  const globalStyles = read('src/config/style/global.css');
  assert(
    !globalStyles.includes('background: #1c1d1b') &&
      !globalStyles.includes('background-color: #22231f') &&
      globalStyles.includes('var(--border)'),
    'Result grid styling must derive from theme variables instead of fixed dark backgrounds.'
  );
  assert(
    component.includes('data-product-workspace') &&
      component.includes('rounded-[1.75rem]') &&
      component.includes('border-border/60') &&
      component.includes('shadow-sm'),
    'The generator must present one polished product workspace shell.'
  );
  assert(
    component.includes('data-product-model-group') &&
      component.includes('data-product-aspect-group') &&
      component.includes('bg-primary/[0.08]'),
    'Model and aspect choices must read as cohesive product selectors.'
  );
  assert(
    component.includes('bg-muted/35') &&
      component.includes('border-transparent') &&
      component.includes('focus:border-primary/25') &&
      component.includes('focus:ring-primary/10'),
    'The prompt must use a soft creative-input treatment instead of a boxed form field.'
  );
  assert(
    component.includes('data-product-result-panel') &&
      component.includes('data-product-result-canvas') &&
      component.includes('bg-background/65') &&
      component.includes('ring-border/25'),
    'The result area must use a quiet creative canvas hierarchy.'
  );
  for (const technicalPanelToken of [
    'dark:bg-neutral',
    'dark:border-neutral',
    'dark:text-neutral',
  ]) {
    assert(
      !component.includes(technicalPanelToken),
      `The polished workspace must not retain ${technicalPanelToken}.`
    );
  }
  assert(
    !/\bborder-b(?:\s|-)/.test(component),
    'The polished workspace must not retain horizontal panel dividers.'
  );
  assert(
    (component.match(/uppercase/g) || []).length <= 1 &&
      (component.match(/font-mono/g) || []).length <= 2,
    'Technical uppercase and monospace styling must be limited to true parameters.'
  );
  assert(
    !uploader.includes(
      'bg-muted/25 hover:bg-muted/40 overflow-hidden rounded-xl border border-dashed'
    ) &&
      uploader.includes('data-upload-actions') &&
      !uploader.includes('absolute right-4 bottom-4'),
    'The upload area must use a soft surface and a non-overlapping action toolbar.'
  );
  assert(
    globalStyles.includes('var(--foreground) 4%') &&
      globalStyles.includes('background-size: 44px 44px') &&
      !globalStyles.includes('var(--border) 48%'),
    'The result grid must be a nearly invisible texture rather than coordinate paper.'
  );
  assert(
    !generationRoute.includes('typeof payload.inputImageUrl'),
    'Generation route must not accept arbitrary remote input image URLs.'
  );
  assert(
    generationRoute.includes("task.provider !== 'apimart'") &&
      generationRoute.includes("taskOptions?.product !== 'instant-ramen'") &&
      !generationRoute.includes('taskProvider.provider !== task.provider'),
    'Polling must use the stored Instant Ramen task marker instead of mutable model config.'
  );
  assert(
    generationRoute.includes('updatePendingAITaskWithProviderResult') &&
      generationRoute.includes('never overwrite a task that the') &&
      generationRoute.includes('Provider task persistence was not claimed.'),
    'Provider acceptance must use a conditional task write that cannot revive a refunded task.'
  );
  assert(
    generationRoute.includes('grantInitialCredits: true') &&
      uploadRoute.includes('grantInitialCredits: true'),
    'The first Supabase bridge must honor existing initial-credit configuration.'
  );
  assert(
    generationRoute.includes('id: requestId') &&
      generationRoute.includes('existingTaskResponse') &&
      generationRoute.includes(
        'Concurrent retries race on the task primary key'
      ),
    'Generation request IDs must provide server-side idempotency before credit consumption.'
  );
  assert(
    generationRoute.includes('payload.requestId.trim().toLowerCase()') &&
      generationRoute.indexOf('const existingTask = await findAITaskById') <
        generationRoute.indexOf('await resolveInstantRamenOwnedInputImage'),
    'Idempotent retries must normalize UUID case and resolve before mutable storage/config checks.'
  );
  assert(
    generationRoute.includes('PROVIDER_SUBMISSION_STALE_MS') &&
      generationRoute.includes("reason: 'provider_submission_stale'") &&
      generationRoute.includes('failStalePendingAITask'),
    'A task abandoned before provider ID persistence must eventually fail and restore its charge.'
  );
  const aiTaskModel = read('src/shared/models/ai_task.ts');
  assert(
    aiTaskModel.includes(".for('update')") &&
      aiTaskModel.includes('eq(credit.status, CreditStatus.ACTIVE)'),
    'Credit rollback must lock and claim one active consumption record.'
  );
  assert(
    aiTaskModel.includes('failStalePendingAITask') &&
      aiTaskModel.includes('lte(aiTask.updatedAt, staleBefore)') &&
      aiTaskModel.includes('isNull(aiTask.taskId)') &&
      aiTaskModel.includes('updatePendingAITaskWithProviderResult'),
    'Stale refund and provider persistence must race through mutually exclusive task conditions.'
  );
  assert(
    aiTaskModel.includes('applyAITaskProviderPollResult') &&
      aiTaskModel.includes('lockedTask.status === AITaskStatus.SUCCESS') &&
      generationRoute.includes('applyAITaskProviderPollResult') &&
      generationRoute.includes('finalStatus'),
    'Concurrent provider polls must preserve terminal task states and return the persisted result.'
  );
  const creditModel = read('src/shared/models/credit.ts');
  assert(
    creditModel.includes('if (remainingToConsume > 0)') &&
      creditModel.includes('Insufficient credits after locking'),
    'Concurrent credit spending must abort unless locked grants cover the full charge.'
  );
  const supabaseBridge = read(
    'src/domains/instant-ramen/server/supabase-user-bridge.ts'
  );
  assert(
    supabaseBridge.includes('db().transaction') &&
      supabaseBridge.includes('grantCreditsForNewUser(insertedUser, tx)') &&
      creditModel.includes(
        'export async function grantCreditsForNewUser(user: User, tx?: any)'
      ),
    'Supabase user creation and configured initial credits must commit atomically.'
  );

  for (const phrase of [
    'Text to Image',
    'Image to Image',
    'Describe how you want to transform this image...',
    '/api/instant-ramen/input-image',
    'Original',
    'Generated',
  ]) {
    assert(component.includes(phrase), `Generator UI must include ${phrase}.`);
  }
  assert(
    component.includes('window.crypto.randomUUID()') &&
      component.includes('generationRequestIdRef'),
    'The generator must reuse one request UUID across an ambiguous network retry.'
  );
  assert(
    component.includes('PENDING_GENERATION_STORAGE_PREFIX') &&
      component.includes('window.sessionStorage.setItem') &&
      component.includes('submitGenerationRequest(recoveryRequest)') &&
      component.includes('readPendingGenerationRecovery(session.user.id)'),
    'A pending charged task must replay the same request UUID after refresh without leaking across users.'
  );
  assert(
    component.includes('response.status !== 401') &&
      component.includes('response.status !== 403') &&
      !component.includes('PENDING_GENERATION_MAX_AGE_MS'),
    'Authentication changes or an arbitrary local TTL must not discard an unknown charged task ID.'
  );

  console.log('Instant Ramen image-to-image MVP verified.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
