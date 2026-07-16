'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useInstantRamenAuth } from '../auth';
import {
  instantRamenGeneratorEntryModels,
  instantRamenTextToImageMvpModels,
  instantRamenTextToImageSizes,
  resolveInstantRamenGeneratorModel,
} from '../product';

type GenerateResult = {
  imageUrl: string | null;
  model: string;
  provider: string;
  providerModelId?: string;
  status?: 'pending' | 'succeeded' | 'failed';
  taskId?: string;
  mock: boolean;
};

const INSTANT_RAMEN_GENERATION_POLL_INTERVAL_MS = 2000;
const INSTANT_RAMEN_GENERATION_POLL_MAX_ATTEMPTS = 90;

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
  const searchParams = useSearchParams();
  const requestedModel = searchParams.get('model');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(() =>
    resolveInstantRamenGeneratorModel(requestedModel)
  );
  const [size, setSize] = useState('16:9');
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const { openAuthModal, session } = useInstantRamenAuth();

  useEffect(() => {
    setModel(resolveInstantRamenGeneratorModel(requestedModel));
  }, [requestedModel]);

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

  const selectedModel = useMemo(
    () =>
      instantRamenTextToImageMvpModels.find((item) => item.slug === model) ??
      instantRamenTextToImageMvpModels[0],
    [model]
  );
  const selectedModelConfig = useMemo(
    () =>
      instantRamenGeneratorEntryModels.find((item) => item.slug === model) ??
      instantRamenGeneratorEntryModels.find((item) => item.allowGeneration),
    [model]
  );

  async function pollTaskStatus(taskId: string) {
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
        throw new Error(payload.error || 'Image generation status failed.');
      }

      if (payload.data?.status === 'failed') {
        throw new Error('Image generation failed.');
      }

      if (payload.data?.status === 'succeeded' && payload.data?.imageUrl) {
        return payload.data;
      }
    }

    throw new Error(
      'Image generation is still processing after 3 minutes. Please try again soon.'
    );
  }

  async function handleGenerate() {
    setError('');
    setResult(null);

    if (!prompt.trim()) {
      setError('Please enter a prompt first.');
      return;
    }

    if (!selectedModel) {
      setError('Please choose an available model first.');
      return;
    }

    if (!session) {
      openAuthModal();
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/instant-ramen/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model,
          size,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Image generation failed.');
      }

      if (payload.data?.status === 'pending' && payload.data?.taskId) {
        setResult(payload.data);
        const finalResult = await pollTaskStatus(payload.data.taskId);
        setResult({
          ...payload.data,
          ...finalResult,
          mock: false,
        });
        return;
      }

      setResult(payload.data);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : 'Image generation failed.'
      );
    } finally {
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

  const resultStatus = error
    ? 'Generation stopped'
    : isLoading
      ? result?.status === 'pending'
        ? 'Rendering image'
        : 'Starting task'
      : result?.imageUrl
        ? 'Image ready'
        : 'Ready for your prompt';

  return (
    <section
      aria-label="AI image generator"
      className={`bg-card overflow-hidden rounded-xl border ${
        compact ? 'w-full' : ''
      }`}
    >
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <div className="min-w-0 border-b p-5 sm:p-7 lg:border-r lg:border-b-0 lg:p-8">
          <div className="mb-7 flex items-start justify-between gap-4 border-b pb-5">
            <div>
              <p className="text-primary font-mono text-xs font-semibold tracking-[0.16em] uppercase">
                Text to image
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
                Build the prompt.
              </h3>
            </div>
            <span className="text-muted-foreground rounded border px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase">
              MVP
            </span>
          </div>

          <div className="space-y-7">
            <label className="block" htmlFor="instant-ramen-prompt">
              <span className="text-sm font-bold">Prompt</span>
              <span className="text-muted-foreground ml-2 font-mono text-[10px] tracking-[0.12em] uppercase">
                Required
              </span>
              <textarea
                id="instant-ramen-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="A cinematic photograph of a circular observatory in the desert at blue hour, warm orange moon, fine architectural detail…"
                className="bg-background placeholder:text-muted-foreground/65 focus:border-primary focus:ring-ring/20 mt-2 min-h-44 w-full resize-y rounded-lg border p-4 text-base leading-7 transition outline-none focus:ring-2"
              />
            </label>

            <fieldset>
              <legend className="text-sm font-bold">Model</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {instantRamenGeneratorEntryModels.map((option) => {
                  const isSelected = option.slug === model;
                  const canGenerate = option.allowGeneration;

                  return (
                    <button
                      key={option.slug}
                      type="button"
                      data-model-slug={option.slug}
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (canGenerate) {
                          setModel(option.slug);
                        }
                      }}
                      disabled={!canGenerate}
                      className={`focus-visible:ring-ring min-h-24 rounded-lg border p-3 text-left transition focus-visible:ring-2 focus-visible:outline-none ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : canGenerate
                            ? 'bg-background hover:border-foreground/40 hover:bg-muted/45'
                            : 'bg-muted/30 text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-start justify-between gap-2 font-mono text-xs font-bold">
                        {option.displayName}
                        {!canGenerate ? (
                          <span className="rounded border px-1.5 py-0.5 text-[8px] tracking-[0.1em] uppercase">
                            Soon
                          </span>
                        ) : null}
                      </span>
                      <span className="text-muted-foreground mt-2 block text-[11px] leading-4">
                        {canGenerate
                          ? `${option.creditCost} credits · ${option.provider === 'apimart' ? 'Available' : 'Provider'}`
                          : 'Not available for generation'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-bold">Aspect ratio</legend>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {instantRamenTextToImageSizes.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={size === option.value}
                    onClick={() => setSize(option.value)}
                    className={`focus-visible:ring-ring min-h-11 rounded-md border px-2 py-2 font-mono text-xs transition focus-visible:ring-2 focus-visible:outline-none ${
                      size === option.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted'
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
              className="border-primary bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-md border px-5 py-3 text-sm font-black transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  />
                  Generating · {elapsedSeconds}s
                </>
              ) : (
                <>
                  Generate with {selectedModel?.label}
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>

            <p className="text-muted-foreground text-center text-xs leading-5">
              {session
                ? `Signed in · ${selectedModelConfig?.creditCost ?? 0} credits per generation`
                : 'Sign in is required before generation starts.'}
            </p>
          </div>
        </div>

        <div className="min-w-0 bg-neutral-950 p-4 text-neutral-50 sm:p-6 lg:p-8">
          <div className="mb-4 flex min-h-11 items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] text-white/50 uppercase">
                Result
              </p>
              <p className="mt-1 text-sm font-semibold" aria-live="polite">
                {resultStatus}
                {isLoading ? ` · ${selectedModel?.label}` : ''}
              </p>
            </div>
            {result?.imageUrl ? (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/20 px-4 py-2 font-mono text-xs font-bold text-white transition hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none"
              >
                Download
              </button>
            ) : null}
          </div>

          <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-neutral-900 sm:min-h-[520px] lg:min-h-[620px]">
            {result?.imageUrl ? (
              // Generated result URLs are dynamic provider assets and cannot be
              // safely predeclared in Next.js remote image patterns.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.imageUrl}
                alt={prompt || 'Instant Ramen generated result'}
                className="h-full max-h-[760px] w-full object-contain"
              />
            ) : isLoading ? (
              <div className="max-w-sm px-8 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-orange-400/35">
                  <span
                    aria-hidden="true"
                    className="h-6 w-6 animate-spin rounded-full border-2 border-orange-400 border-t-transparent"
                  />
                </div>
                <p className="mt-6 text-lg font-bold">
                  {result?.status === 'pending'
                    ? 'Rendering your image'
                    : 'Preparing the generation task'}
                </p>
                <p className="mt-2 font-mono text-xs leading-5 text-white/50">
                  {selectedModel?.label} · {size} · {elapsedSeconds}s
                </p>
              </div>
            ) : (
              <div className="max-w-sm px-8 text-center">
                <span
                  className="font-mono text-5xl text-orange-400"
                  aria-hidden="true"
                >
                  +
                </span>
                <p className="mt-5 text-lg font-bold">
                  Your image will appear here.
                </p>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Write a clear prompt, choose an available model, and start the
                  generation task.
                </p>
              </div>
            )}
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-4 flex flex-col gap-4 rounded-lg border border-red-400/35 bg-red-950/40 p-4 text-sm text-red-100 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="leading-6">{error}</p>
              <button
                type="button"
                onClick={handleGenerate}
                className="min-h-11 shrink-0 rounded-md border border-red-300/30 px-4 py-2 font-mono text-xs font-bold transition hover:bg-red-100 hover:text-red-950 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none"
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
