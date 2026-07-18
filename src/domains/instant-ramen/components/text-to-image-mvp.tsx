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

function keepModelNameWithinTwoLines(displayName: string) {
  return displayName.replace(/ (?=[^ ]+$)/, '\u00a0');
}

const INSTANT_RAMEN_GENERATION_POLL_INTERVAL_MS = 2000;
const INSTANT_RAMEN_GENERATION_POLL_MAX_ATTEMPTS = 90;
const INSTANT_RAMEN_EXAMPLE_PROMPTS = [
  'A cinematic fashion portrait at a neon night market, rain reflections, cobalt and coral light, editorial photography',
  'A bright commercial product photograph of cobalt headphones suspended in a crystal water splash',
  'A joyful children’s-book illustration of a tiny garden growing on the moon, painted gouache texture',
] as const;

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
  const [examplePromptIndex, setExamplePromptIndex] = useState(0);
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

  function applyExamplePrompt() {
    setPrompt(INSTANT_RAMEN_EXAMPLE_PROMPTS[examplePromptIndex]);
    setExamplePromptIndex(
      (currentIndex) =>
        (currentIndex + 1) % INSTANT_RAMEN_EXAMPLE_PROMPTS.length
    );
    setError('');
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
      className={`instant-ramen-generator-shell bg-card overflow-hidden rounded-2xl border ${
        compact ? 'w-full' : ''
      }`}
    >
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <div className="min-w-0 border-b p-5 sm:p-7 lg:border-r lg:border-b-0 lg:p-8">
          <div className="mb-6 flex items-start justify-between gap-4 border-b pb-5">
            <div>
              <p className="text-primary font-mono text-xs font-semibold tracking-[0.16em] uppercase">
                Text to image
              </p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.025em] sm:text-3xl">
                Describe your image.
              </h3>
            </div>
            <span className="text-muted-foreground rounded border px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase">
              Live tool
            </span>
          </div>

          <div className="space-y-6">
            <label className="block" htmlFor="instant-ramen-prompt">
              <span className="text-sm font-bold">Prompt</span>
              <span className="text-muted-foreground ml-2 font-mono text-[10px] tracking-[0.12em] uppercase">
                Required
              </span>
              <textarea
                id="instant-ramen-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="A cinematic fashion portrait at a neon night market, rain reflections, cobalt and coral light…"
                className="bg-background placeholder:text-muted-foreground/60 focus:border-primary focus:ring-ring/20 mt-2 min-h-40 w-full resize-y rounded-xl border p-4 text-base leading-7 transition outline-none focus:ring-2"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={applyExamplePrompt}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 text-left text-xs font-semibold transition focus-visible:ring-2 focus-visible:outline-none"
                >
                  Try an example prompt
                  <span aria-hidden="true">↗</span>
                </button>
                <span className="text-muted-foreground font-mono text-[10px]">
                  {prompt.length}/2000
                </span>
              </div>
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
                      data-mobile-model-card
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (canGenerate) {
                          setModel(option.slug);
                        }
                      }}
                      disabled={!canGenerate}
                      className={`focus-visible:ring-ring min-h-[72px] rounded-xl border px-3 py-1.5 text-left transition focus-visible:ring-2 focus-visible:outline-none sm:min-h-24 sm:p-3 ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : canGenerate
                            ? 'bg-background hover:border-foreground/40 hover:bg-muted/45'
                            : 'bg-muted/30 text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      <span className="flex h-full items-center justify-between gap-2 sm:items-start">
                        <span className="min-w-0">
                          <span className="line-clamp-2 block text-[13px] leading-4 font-bold text-balance sm:text-sm sm:leading-5">
                            {keepModelNameWithinTwoLines(option.displayName)}
                          </span>
                          {canGenerate ? (
                            <span className="text-muted-foreground mt-0.5 block truncate font-mono text-[9px] leading-4 sm:mt-3 sm:text-[10px]">
                              {option.creditCost} credits
                            </span>
                          ) : null}
                        </span>
                        <span
                          className={`shrink-0 rounded border px-1 py-0.5 font-mono text-[8px] tracking-[0.06em] uppercase sm:px-1.5 sm:py-1 sm:tracking-[0.08em] ${
                            canGenerate
                              ? 'border-emerald-700/20 text-emerald-800 dark:border-emerald-300/25 dark:text-emerald-300'
                              : 'border-orange-700/20 text-orange-800 dark:border-orange-300/25 dark:text-orange-300'
                          }`}
                        >
                          {canGenerate ? 'Available' : 'Coming soon'}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-bold">Aspect ratio</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {instantRamenTextToImageSizes.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={size === option.value}
                    onClick={() => setSize(option.value)}
                    className={`focus-visible:ring-ring min-h-11 min-w-14 rounded-md border px-3 py-2 font-mono text-xs transition focus-visible:ring-2 focus-visible:outline-none ${
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
              className="border-primary bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-lg border px-5 py-3 text-sm font-extrabold transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
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

        <div className="instant-ramen-generator-result min-w-0 bg-[#1c1d1b] p-4 text-neutral-50 sm:p-6 lg:p-8">
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

          <div className="instant-ramen-result-grid relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#242522] sm:min-h-[520px] lg:min-h-[620px]">
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
              <div
                data-generator-empty-state
                className="max-w-sm rounded-2xl border border-white/10 bg-black/20 px-8 py-9 text-center backdrop-blur-sm"
              >
                <div
                  aria-hidden="true"
                  className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-orange-300/35 bg-orange-400/10 text-2xl text-orange-300"
                >
                  ↗
                </div>
                <p className="mt-5 text-lg font-bold">
                  Your image will appear here.
                </p>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Write a clear prompt, choose an available model, and start the
                  generation task.
                </p>
                <button
                  type="button"
                  onClick={applyExamplePrompt}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-white/15 px-4 py-2 text-xs font-semibold text-white transition hover:border-orange-300/50 hover:bg-orange-400/10 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none"
                >
                  Try an example prompt
                </button>
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
