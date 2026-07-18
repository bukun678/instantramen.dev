'use client';

/* eslint-disable @next/next/no-img-element */
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  ImageUploader,
  type ImageUploaderValue,
} from '@/shared/blocks/common/image-uploader';

import { useInstantRamenAuth } from '../auth';
import {
  instantRamenGeneratorEntryModels,
  instantRamenTextToImageSizes,
  resolveInstantRamenGeneratorModel,
  type InstantRamenGenerationMode,
} from '../product';

type GenerateResult = {
  creditCost?: number;
  imageUrl: string | null;
  mode: InstantRamenGenerationMode;
  model: string;
  provider: string;
  providerModelId?: string;
  sourceImageUrl?: string;
  status?: 'pending' | 'succeeded' | 'failed';
  taskId?: string;
  mock: boolean;
};

type PendingGenerationRecovery = {
  createdAt: number;
  inputImageKey?: string;
  mode: InstantRamenGenerationMode;
  model: string;
  prompt: string;
  requestId: string;
  size: string;
  userId: string;
};

type GenerationRequestPayload = Omit<
  PendingGenerationRecovery,
  'createdAt' | 'userId'
>;

const PENDING_GENERATION_STORAGE_PREFIX =
  'instant-ramen:pending-image-generation';
const GENERATION_REQUEST_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function getPendingGenerationStorageKey(userId: string) {
  return `${PENDING_GENERATION_STORAGE_PREFIX}:${encodeURIComponent(userId)}`;
}

function readPendingGenerationRecovery(
  userId: string
): PendingGenerationRecovery | null {
  try {
    const storageKey = getPendingGenerationStorageKey(userId);
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PendingGenerationRecovery>;
    const isValid =
      typeof parsed.createdAt === 'number' &&
      parsed.createdAt > 0 &&
      (parsed.mode === 'text-to-image' || parsed.mode === 'image-to-image') &&
      typeof parsed.model === 'string' &&
      typeof parsed.prompt === 'string' &&
      typeof parsed.requestId === 'string' &&
      GENERATION_REQUEST_ID_PATTERN.test(parsed.requestId) &&
      typeof parsed.size === 'string' &&
      parsed.userId === userId;

    if (!isValid) {
      window.sessionStorage.removeItem(storageKey);
      return null;
    }

    return parsed as PendingGenerationRecovery;
  } catch {
    return null;
  }
}

function writePendingGenerationRecovery(record: PendingGenerationRecovery) {
  try {
    window.sessionStorage.setItem(
      getPendingGenerationStorageKey(record.userId),
      JSON.stringify(record)
    );
  } catch {
    // Generation remains safe through server idempotency even if this browser
    // blocks session storage; only cross-refresh recovery is unavailable.
  }
}

function createGenerationRequestId() {
  if (typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
}

function keepModelNameWithinTwoLines(displayName: string) {
  return displayName.replace(/ (?=[^ ]+$)/, '\u00a0');
}

function normalizeRequestedMode(
  value: string | null
): InstantRamenGenerationMode {
  return value === 'image-to-image' ? 'image-to-image' : 'text-to-image';
}

const INSTANT_RAMEN_GENERATION_POLL_INTERVAL_MS = 2000;
const INSTANT_RAMEN_GENERATION_POLL_MAX_ATTEMPTS = 90;
const INSTANT_RAMEN_EXAMPLE_PROMPTS = {
  'text-to-image': [
    'A cinematic fashion portrait at a neon night market, rain reflections, cobalt and coral light, editorial photography',
    'A bright commercial product photograph of cobalt headphones suspended in a crystal water splash',
    'A joyful children’s-book illustration of a tiny garden growing on the moon, painted gouache texture',
  ],
  'image-to-image': [
    'Change the background to a beach at sunset while keeping the subject unchanged',
    'Turn this photo into a watercolor illustration with soft paper texture',
    'Keep the product unchanged and create a luxury studio background',
  ],
} as const;

function GeneratorFallback() {
  return (
    <div
      className="bg-card min-h-[720px] animate-pulse rounded-xl border"
      aria-hidden="true"
    />
  );
}

export function InstantRamenTextToImageMvp({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <Suspense fallback={<GeneratorFallback />}>
      <InstantRamenTextToImageClient compact={compact} />
    </Suspense>
  );
}

function InstantRamenTextToImageClient({ compact }: { compact: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedModel = searchParams.get('model');
  const requestedMode = normalizeRequestedMode(searchParams.get('mode'));
  const [mode, setMode] = useState<InstantRamenGenerationMode>(requestedMode);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(() =>
    resolveInstantRamenGeneratorModel(requestedModel, requestedMode)
  );
  const [size, setSize] = useState('16:9');
  const [inputImages, setInputImages] = useState<ImageUploaderValue[]>([]);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [examplePromptIndex, setExamplePromptIndex] = useState(0);
  const isSubmittingRef = useRef(false);
  const generationRequestIdRef = useRef<string | null>(null);
  const pendingGenerationUserIdRef = useRef<string | null>(null);
  const hasAttemptedRecoveryRef = useRef(false);
  const { isLoadingSession, openAuthModal, session } = useInstantRamenAuth();

  const clearPendingGeneration = useCallback(() => {
    generationRequestIdRef.current = null;
    try {
      if (pendingGenerationUserIdRef.current) {
        window.sessionStorage.removeItem(
          getPendingGenerationStorageKey(pendingGenerationUserIdRef.current)
        );
      }
    } catch {
      // Storage access can be disabled without affecting the active request.
    }
    pendingGenerationUserIdRef.current = null;
  }, []);

  useEffect(() => {
    const nextMode = normalizeRequestedMode(searchParams.get('mode'));
    setMode(nextMode);
    setModel(
      resolveInstantRamenGeneratorModel(searchParams.get('model'), nextMode)
    );
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading) {
      setElapsedSeconds(0);
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isLoading]);

  const visibleModels = useMemo(
    () =>
      instantRamenGeneratorEntryModels.filter((option) =>
        mode === 'image-to-image'
          ? option.allowGeneration &&
            option.supportedModes.includes('image-to-image') &&
            option.capabilities.supportsImageInput &&
            Boolean(option.imageInput) &&
            option.imageInput?.maxImages === 1 &&
            typeof option.modeCreditCosts['image-to-image'] === 'number'
          : option.supportedModes.includes('text-to-image')
      ),
    [mode]
  );
  const selectedModelConfig = useMemo(
    () =>
      visibleModels.find((item) => item.slug === model) ??
      visibleModels.find((item) => item.allowGeneration) ??
      visibleModels[0],
    [model, visibleModels]
  );
  const selectedModelLabel = selectedModelConfig?.displayName ?? 'Model';
  const selectedCreditCost = selectedModelConfig?.modeCreditCosts[mode];
  const inputPolicy =
    mode === 'image-to-image' ? selectedModelConfig?.imageInput : undefined;
  const inputImage = inputImages[0];
  const uploadedInputImage =
    inputImage?.status === 'uploaded' && inputImage.key ? inputImage : null;

  useEffect(() => {
    if (!visibleModels.some((option) => option.slug === model)) {
      setModel(resolveInstantRamenGeneratorModel(model, mode));
    }
  }, [mode, model, visibleModels]);

  const pollTaskStatus = useCallback(
    async (taskId: string) => {
      for (
        let attempt = 0;
        attempt < INSTANT_RAMEN_GENERATION_POLL_MAX_ATTEMPTS;
        attempt += 1
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, INSTANT_RAMEN_GENERATION_POLL_INTERVAL_MS)
        );

        const response = await fetch(
          `/api/instant-ramen/text-to-image?taskId=${encodeURIComponent(taskId)}`
        );
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          if (response.status === 404 && attempt < 2) {
            continue;
          }
          if (
            response.status < 500 &&
            response.status !== 401 &&
            response.status !== 403
          ) {
            clearPendingGeneration();
          }
          throw new Error(payload.error || 'Image generation status failed.');
        }

        if (payload.data?.status === 'failed') {
          clearPendingGeneration();
          throw new Error(
            'Image generation failed. Your credits were restored.'
          );
        }

        if (payload.data?.status === 'succeeded' && payload.data?.imageUrl) {
          clearPendingGeneration();
          return payload.data;
        }
      }

      throw new Error(
        'Image generation is still processing after 3 minutes. Please try again soon.'
      );
    },
    [clearPendingGeneration]
  );

  const submitGenerationRequest = useCallback(
    async (generationRequest: GenerationRequestPayload) => {
      const response = await fetch('/api/instant-ramen/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationRequest),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        const safelyTerminalError = [
          'provider_not_configured',
          'provider_request_failed',
          'public_storage_url_unavailable',
          'storage_unavailable',
        ].includes(payload.code);
        if (
          (response.status < 500 &&
            response.status !== 401 &&
            response.status !== 403) ||
          safelyTerminalError
        ) {
          clearPendingGeneration();
        }
        throw new Error(payload.error || 'Image generation failed.');
      }

      return payload.data;
    },
    [clearPendingGeneration]
  );

  useEffect(() => {
    if (hasAttemptedRecoveryRef.current || isLoadingSession || !session) {
      return;
    }

    const pending = readPendingGenerationRecovery(session.user.id);
    if (!pending) {
      return;
    }

    hasAttemptedRecoveryRef.current = true;
    generationRequestIdRef.current = pending.requestId;
    pendingGenerationUserIdRef.current = pending.userId;
    isSubmittingRef.current = true;
    setMode(pending.mode);
    setModel(pending.model);
    setPrompt(pending.prompt);
    setSize(pending.size);
    setError('');
    setIsLoading(true);

    const recoveryRequest: GenerationRequestPayload = {
      inputImageKey: pending.inputImageKey,
      mode: pending.mode,
      model: pending.model,
      prompt: pending.prompt,
      requestId: pending.requestId,
      size: pending.size,
    };

    void submitGenerationRequest(recoveryRequest)
      .then(async (submissionResult) => {
        const pendingResult = {
          ...submissionResult,
          mode: pending.mode,
        } as GenerateResult;
        setResult(pendingResult);

        if (submissionResult?.status === 'pending') {
          const finalResult = await pollTaskStatus(pending.requestId);
          setResult({
            ...pendingResult,
            ...finalResult,
            mock: false,
          });
          return;
        }

        clearPendingGeneration();
      })
      .catch((recoveryError: unknown) => {
        setError(
          recoveryError instanceof Error
            ? recoveryError.message
            : 'Image generation recovery failed.'
        );
      })
      .finally(() => {
        isSubmittingRef.current = false;
        setIsLoading(false);
      });
  }, [
    clearPendingGeneration,
    isLoadingSession,
    pollTaskStatus,
    session,
    submitGenerationRequest,
  ]);

  async function handleGenerate() {
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    setError('');

    if (!session) {
      openAuthModal();
      return;
    }

    if (
      result?.status === 'pending' &&
      result.taskId &&
      result.taskId === generationRequestIdRef.current
    ) {
      isSubmittingRef.current = true;
      setError('');
      setIsLoading(true);
      try {
        const finalResult = await pollTaskStatus(result.taskId);
        setResult({
          ...result,
          ...finalResult,
          mock: false,
        });
      } catch (pollError) {
        setError(
          pollError instanceof Error
            ? pollError.message
            : 'Image generation status failed.'
        );
      } finally {
        isSubmittingRef.current = false;
        setIsLoading(false);
      }
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt first.');
      return;
    }

    if (!selectedModelConfig?.allowGeneration) {
      setError('Please choose an available model first.');
      return;
    }

    if (mode === 'image-to-image') {
      if (inputImage?.status === 'uploading') {
        setError('Wait for the reference image upload to finish.');
        return;
      }
      if (!uploadedInputImage) {
        setError('Upload a reference image before generating.');
        return;
      }
    }

    isSubmittingRef.current = true;
    setResult(null);
    setIsLoading(true);

    const sourceImageUrl =
      mode === 'image-to-image'
        ? uploadedInputImage?.url || uploadedInputImage?.preview
        : undefined;
    const requestId =
      generationRequestIdRef.current ?? createGenerationRequestId();
    generationRequestIdRef.current = requestId;
    pendingGenerationUserIdRef.current = session.user.id;
    const generationRequest: GenerationRequestPayload = {
      inputImageKey:
        mode === 'image-to-image' ? uploadedInputImage?.key : undefined,
      mode,
      model,
      prompt,
      requestId,
      size,
    };
    writePendingGenerationRecovery({
      createdAt: Date.now(),
      ...generationRequest,
      prompt: prompt.trim(),
      userId: session.user.id,
    });

    try {
      const submissionResult = await submitGenerationRequest(generationRequest);

      const pendingResult = {
        ...submissionResult,
        mode,
        sourceImageUrl,
      } as GenerateResult;

      if (submissionResult?.status === 'pending' && submissionResult?.taskId) {
        setResult(pendingResult);
        const finalResult = await pollTaskStatus(submissionResult.taskId);
        setResult({
          ...pendingResult,
          ...finalResult,
          mock: false,
        });
        return;
      }

      clearPendingGeneration();
      setResult(pendingResult);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : 'Image generation failed.'
      );
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  }

  async function handleDownload() {
    if (!result?.imageUrl) {
      return;
    }

    try {
      const response = await fetch(result.imageUrl);
      if (!response.ok) {
        throw new Error('Download request failed.');
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'instant-ramen-generated-image.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(result.imageUrl, '_blank', 'noopener,noreferrer');
    }
  }

  function applyExamplePrompt() {
    const prompts = INSTANT_RAMEN_EXAMPLE_PROMPTS[mode];
    clearPendingGeneration();
    setPrompt(prompts[examplePromptIndex % prompts.length]);
    setExamplePromptIndex((currentIndex) => currentIndex + 1);
    setError('');
  }

  function changeMode(nextMode: InstantRamenGenerationMode) {
    if (isLoading || nextMode === mode) {
      return;
    }
    const nextModel = resolveInstantRamenGeneratorModel(model, nextMode);
    setMode(nextMode);
    clearPendingGeneration();
    setModel(nextModel);
    setResult(null);
    setError('');
    setExamplePromptIndex(0);

    if (
      pathname.endsWith('/ai-image-generator') ||
      pathname.endsWith('/ai-image-generator/')
    ) {
      const nextSearchParams = new URLSearchParams(searchParams.toString());
      if (nextMode === 'image-to-image') {
        nextSearchParams.set('mode', nextMode);
      } else {
        nextSearchParams.delete('mode');
      }
      nextSearchParams.set('model', nextModel);
      const query = nextSearchParams.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`, {
        scroll: false,
      });
    }
  }

  function handleInputImagesChange(items: ImageUploaderValue[]) {
    clearPendingGeneration();
    setInputImages(items);
    setResult(null);
    setError(items[0]?.error ?? '');
  }

  const resultStatus = error
    ? 'Generation stopped'
    : isLoading
      ? result?.status === 'pending'
        ? mode === 'image-to-image'
          ? 'Transforming image'
          : 'Rendering image'
        : 'Starting task'
      : result?.imageUrl
        ? 'Image ready'
        : mode === 'image-to-image'
          ? 'Ready for your reference'
          : 'Ready for your prompt';

  return (
    <section
      data-product-workspace
      aria-label="AI image generator"
      className={`instant-ramen-generator-shell border-border/60 bg-card text-card-foreground overflow-hidden rounded-[1.75rem] border shadow-sm ${
        compact ? 'w-full' : ''
      }`}
    >
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <div className="bg-card min-w-0 p-5 sm:p-7 lg:p-8">
          <div
            role="group"
            aria-label="Generation mode"
            className="bg-muted/60 mb-5 grid grid-cols-2 rounded-xl p-1"
          >
            {(
              [
                ['text-to-image', 'Text to Image'],
                ['image-to-image', 'Image to Image'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                disabled={isLoading}
                onClick={() => changeMode(value)}
                className={`focus-visible:ring-ring min-h-11 rounded-lg px-3 py-2 text-sm font-bold transition focus-visible:ring-2 focus-visible:outline-none disabled:cursor-wait ${
                  mode === value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-primary text-xs font-semibold">
                {mode === 'image-to-image' ? 'Image to image' : 'Text to image'}
              </p>
              <h3 className="mt-1.5 text-2xl font-extrabold tracking-[-0.025em] sm:text-3xl">
                {mode === 'image-to-image'
                  ? 'Transform your image.'
                  : 'Describe your image.'}
              </h3>
            </div>
            <span className="text-muted-foreground/70 px-1 py-1 text-[11px] font-medium">
              Live
            </span>
          </div>

          <div className="space-y-5 sm:space-y-6">
            {mode === 'image-to-image' && inputPolicy ? (
              <ImageUploader
                acceptedMimeTypes={inputPolicy.acceptedMimeTypes}
                allowMultiple={false}
                disabled={isLoading}
                maxImages={inputPolicy.maxImages}
                maxSizeMB={inputPolicy.maxBytes / 1024 / 1024}
                uploadUrl="/api/instant-ramen/input-image"
                presentation="dropzone"
                title="Upload reference image"
                emptyHint="Click or drag one image here"
                onChange={handleInputImagesChange}
              />
            ) : null}

            <label className="block" htmlFor="instant-ramen-prompt">
              <span className="text-sm font-bold">Prompt</span>
              <span className="text-muted-foreground/65 ml-1.5 text-[11px] font-medium">
                Required
              </span>
              <textarea
                id="instant-ramen-prompt"
                value={prompt}
                maxLength={2000}
                disabled={isLoading}
                onChange={(event) => {
                  clearPendingGeneration();
                  setPrompt(event.target.value);
                }}
                placeholder={
                  mode === 'image-to-image'
                    ? 'Describe how you want to transform this image...'
                    : 'A cinematic fashion portrait at a neon night market, rain reflections, cobalt and coral light…'
                }
                className="bg-muted/35 placeholder:text-muted-foreground/55 focus:border-primary/25 focus:bg-card focus:ring-primary/10 mt-2 min-h-32 w-full resize-y rounded-2xl border border-transparent px-4 py-3.5 text-base leading-7 transition-colors outline-none focus:ring-2 disabled:cursor-wait disabled:opacity-70 sm:min-h-36 sm:px-5 sm:py-4"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={applyExamplePrompt}
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-9 items-center gap-2 text-left text-xs font-medium transition focus-visible:ring-2 focus-visible:outline-none disabled:cursor-wait"
                >
                  Try an example prompt
                  <span aria-hidden="true">↗</span>
                </button>
                <span className="text-muted-foreground text-[11px] tabular-nums">
                  {prompt.length}/2000
                </span>
              </div>
            </label>

            <fieldset disabled={isLoading}>
              <legend className="text-sm font-bold">Model</legend>
              <div
                data-product-model-group
                className={`bg-muted/40 mt-2 grid gap-1 rounded-xl p-1 ${
                  mode === 'image-to-image'
                    ? 'sm:grid-cols-2'
                    : 'sm:grid-cols-3'
                }`}
              >
                {visibleModels.map((option) => {
                  const isSelected = option.slug === model;
                  const canGenerate = option.allowGeneration;
                  const cost = option.modeCreditCosts[mode];

                  return (
                    <button
                      key={option.slug}
                      type="button"
                      data-model-slug={option.slug}
                      data-mobile-model-card
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (canGenerate) {
                          clearPendingGeneration();
                          setModel(option.slug);
                        }
                      }}
                      disabled={!canGenerate || isLoading}
                      className={`focus-visible:ring-ring min-h-[64px] rounded-lg border border-transparent px-3 py-2 text-left transition focus-visible:ring-2 focus-visible:outline-none sm:min-h-[76px] sm:px-3.5 sm:py-3 ${
                        isSelected
                          ? 'bg-primary/[0.08] ring-primary/20 ring-1'
                          : canGenerate
                            ? 'hover:bg-card/70 bg-transparent'
                            : 'text-muted-foreground cursor-not-allowed bg-transparent opacity-60'
                      }`}
                    >
                      <span className="flex h-full items-center justify-between gap-2">
                        <span className="min-w-0">
                          <span className="line-clamp-2 block text-[13px] leading-4 font-bold text-balance sm:text-sm sm:leading-5">
                            {keepModelNameWithinTwoLines(option.displayName)}
                          </span>
                          {canGenerate && typeof cost === 'number' ? (
                            <span className="text-muted-foreground mt-1 block truncate text-[11px] leading-4 tabular-nums">
                              {cost} credits
                            </span>
                          ) : null}
                        </span>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 text-[10px] font-medium ${
                            canGenerate
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full ${
                              canGenerate ? 'bg-emerald-500' : 'bg-primary/70'
                            }`}
                          />
                          {canGenerate ? 'Available' : 'Coming soon'}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset disabled={isLoading}>
              <legend className="text-sm font-bold">Output aspect ratio</legend>
              <div
                data-product-aspect-group
                className="bg-muted/50 mt-2 inline-flex max-w-full flex-wrap gap-1 rounded-xl p-1"
              >
                {instantRamenTextToImageSizes.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={size === option.value}
                    onClick={() => {
                      clearPendingGeneration();
                      setSize(option.value);
                    }}
                    className={`focus-visible:ring-ring min-h-9 min-w-12 rounded-lg px-3 py-1.5 font-mono text-xs transition focus-visible:ring-2 focus-visible:outline-none ${
                      size === option.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-card/80 hover:text-foreground'
                    }`}
                  >
                    {option.value}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border-0 px-5 py-3 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  />
                  {mode === 'image-to-image' ? 'Transforming' : 'Generating'} ·{' '}
                  {elapsedSeconds}s
                </>
              ) : (
                <>
                  {mode === 'image-to-image' ? 'Transform' : 'Generate'} with{' '}
                  {selectedModelLabel}
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>

            <p className="text-muted-foreground text-center text-xs leading-5">
              {session
                ? typeof selectedCreditCost === 'number'
                  ? `Signed in · ${selectedCreditCost} credits per generation`
                  : 'Credit cost is unavailable for this mode.'
                : 'Sign in is required before generation starts.'}
            </p>
          </div>
        </div>

        <div
          data-product-result-panel
          className="instant-ramen-generator-result bg-muted/25 text-foreground min-w-0 p-4 sm:p-6 lg:p-8"
        >
          <div className="mb-3 flex min-h-9 items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Result
              </p>
              <p className="mt-0.5 text-sm font-semibold" aria-live="polite">
                {resultStatus}
                {isLoading ? ` · ${selectedModelLabel}` : ''}
              </p>
            </div>
            {result?.imageUrl ? (
              <button
                type="button"
                onClick={handleDownload}
                className="border-border/50 bg-card text-foreground hover:bg-primary hover:text-primary-foreground focus-visible:ring-ring inline-flex min-h-10 items-center justify-center rounded-xl border px-4 py-2 text-xs font-semibold shadow-sm transition focus-visible:ring-2 focus-visible:outline-none"
              >
                Download
              </button>
            ) : null}
          </div>

          <div
            data-product-result-canvas
            className="instant-ramen-result-grid ring-border/25 bg-background/65 relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl p-3 ring-1 ring-inset sm:min-h-[500px] sm:p-4 lg:min-h-[600px]"
          >
            {result?.imageUrl ? (
              result.mode === 'image-to-image' && result.sourceImageUrl ? (
                <div className="grid w-full min-w-0 gap-4 md:grid-cols-2">
                  <figure className="min-w-0">
                    <figcaption className="text-muted-foreground mb-2 px-1 text-xs font-medium">
                      Original
                    </figcaption>
                    <img
                      src={result.sourceImageUrl}
                      alt="Original reference"
                      className="bg-muted/35 aspect-square h-auto w-full rounded-xl object-contain"
                    />
                  </figure>
                  <figure className="min-w-0">
                    <figcaption className="text-primary mb-2 px-1 text-xs font-medium">
                      Generated
                    </figcaption>
                    <img
                      src={result.imageUrl}
                      alt={prompt || 'Instant Ramen generated result'}
                      className="bg-muted/35 aspect-square h-auto w-full rounded-xl object-contain"
                    />
                  </figure>
                </div>
              ) : (
                <img
                  src={result.imageUrl}
                  alt={prompt || 'Instant Ramen generated result'}
                  className="h-full max-h-[760px] w-full rounded-xl object-contain"
                />
              )
            ) : isLoading ? (
              <div className="max-w-sm px-5 text-center">
                {mode === 'image-to-image' && uploadedInputImage ? (
                  <img
                    src={uploadedInputImage.url || uploadedInputImage.preview}
                    alt="Original reference being transformed"
                    className="mx-auto mb-5 h-28 w-28 rounded-xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="bg-primary/10 mx-auto grid h-14 w-14 place-items-center rounded-full">
                    <span
                      aria-hidden="true"
                      className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
                    />
                  </div>
                )}
                <p className="mt-6 text-lg font-bold">
                  {mode === 'image-to-image'
                    ? 'Transforming your image...'
                    : result?.status === 'pending'
                      ? 'Rendering your image'
                      : 'Preparing the generation task'}
                </p>
                <p className="text-muted-foreground mt-2 font-mono text-xs leading-5">
                  {selectedModelLabel} · {size} · {elapsedSeconds}s
                </p>
              </div>
            ) : (
              <div
                data-generator-empty-state
                className="max-w-xs px-5 py-6 text-center"
              >
                <div
                  aria-hidden="true"
                  className="bg-card text-primary mx-auto grid h-11 w-11 place-items-center rounded-xl text-xl shadow-sm"
                >
                  ↗
                </div>
                <p className="mt-4 text-base font-semibold">
                  {mode === 'image-to-image'
                    ? 'Your transformed image will appear here.'
                    : 'Your image will appear here.'}
                </p>
                <p className="text-muted-foreground mt-1.5 text-sm leading-5">
                  {mode === 'image-to-image'
                    ? 'Upload one reference, describe the change, and start the transformation.'
                    : 'Write a clear prompt, choose an available model, and start the generation task.'}
                </p>
                <button
                  type="button"
                  onClick={applyExamplePrompt}
                  className="bg-card/85 text-foreground hover:bg-card focus-visible:ring-ring ring-border/30 mt-4 inline-flex min-h-9 items-center justify-center rounded-lg px-3 py-2 text-xs font-medium shadow-sm ring-1 transition focus-visible:ring-2 focus-visible:outline-none"
                >
                  Try an example prompt
                </button>
              </div>
            )}
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-4 flex flex-col gap-4 rounded-xl border border-red-200/80 bg-red-50/80 p-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between dark:border-red-400/25 dark:bg-red-950/30 dark:text-red-100"
            >
              <p className="leading-6">{error}</p>
              <button
                type="button"
                onClick={handleGenerate}
                className="min-h-10 shrink-0 rounded-lg border border-red-300/70 px-4 py-2 text-xs font-semibold transition hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:border-red-300/30 dark:hover:bg-red-100 dark:hover:text-red-950"
              >
                Try again
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
