'use client';

import { useMemo, useState } from 'react';

import { useInstantRamenAuth } from '../auth';
import {
  instantRamenTextToImageSizes,
  instantRamenGeneratorEntryModels,
  instantRamenTextToImageMvpModels,
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

export function InstantRamenTextToImageMvp({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(instantRamenTextToImageMvpModels[0].slug);
  const [size, setSize] = useState('16:9');
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { openAuthModal, session } = useInstantRamenAuth();

  const selectedModel = useMemo(
    () =>
      instantRamenTextToImageMvpModels.find((item) => item.slug === model) ??
      instantRamenTextToImageMvpModels[0],
    [model]
  );

  async function pollTaskStatus(taskId: string) {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

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

    throw new Error('Image generation is still processing. Please try again soon.');
  }

  async function handleGenerate() {
    setError('');
    setResult(null);

    if (!prompt.trim()) {
      setError('Error: Please enter a prompt first.');
      return;
    }

    if (!selectedModel) {
      setError('Error: Please choose an available model first.');
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
        `Error: ${
          generationError instanceof Error
            ? generationError.message
            : 'Image generation failed.'
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      className={`rounded-[2rem] border bg-background p-5 shadow-sm md:p-6 ${
        compact ? '' : 'w-full'
      }`}
    >
      <div className="mb-5">
        <p className="text-sm font-medium text-muted-foreground">
          Text to Image MVP
        </p>
        <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
          Start generating in 30 seconds
        </h2>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Prompt</span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="A cinematic product photo of instant ramen in a neon Tokyo street, steam rising, ultra detailed..."
            className="mt-2 min-h-32 w-full resize-none rounded-2xl border bg-muted/30 p-4 text-sm outline-none transition focus:border-primary"
          />
        </label>

        <div>
          <p className="text-sm font-medium">Model</p>
          <div className="mt-2 grid gap-3 md:grid-cols-3">
            {instantRamenGeneratorEntryModels.map((option) => {
              const isSelected = option.slug === model;
              const canGenerate = option.allowGeneration;

              return (
                <button
                  key={option.slug}
                  type="button"
                  onClick={() => {
                    if (canGenerate) {
                      setModel(option.slug);
                    }
                  }}
                  disabled={!canGenerate}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : canGenerate
                        ? 'bg-muted/30 hover:bg-muted/60'
                        : 'cursor-not-allowed bg-muted/20 opacity-70'
                  }`}
                >
                  <span className="flex items-center justify-between gap-3 text-sm font-semibold">
                    {option.displayName}
                    {!canGenerate && (
                      <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        Coming Soon
                      </span>
                    )}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                    {option.shortDescription}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Size</span>
          <select
            value={size}
            onChange={(event) => setSize(event.target.value)}
            className="mt-2 w-full rounded-2xl border bg-muted/30 p-4 text-sm outline-none transition focus:border-primary"
          >
            {instantRamenTextToImageSizes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Loading…' : 'Generate'}
        </button>

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-3xl border bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Result</p>
              <p className="text-xs text-muted-foreground">
                {result
                  ? `${selectedModel?.label ?? result.model}${result.status === 'pending' ? ' · processing' : ''}`
                  : 'Your generated image will appear here.'}
              </p>
            </div>
            {result?.imageUrl && (
              <a
                href={result.imageUrl}
                download="instant-ramen-generated-image.png"
                className="rounded-full border px-4 py-2 text-xs font-medium hover:bg-muted"
              >
                Download
              </a>
            )}
          </div>

          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border bg-background">
            {result?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.imageUrl}
                alt={prompt || 'Instant Ramen generated result'}
                className="h-full w-full object-cover"
              />
            ) : (
              <p className="px-8 text-center text-sm text-muted-foreground">
                Enter a prompt, choose GPT Image 2 or Nano Banana, then click
                Generate.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
