'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import type { InstantRamenGenerationMode } from '../product';

const HERO_COPY = {
  'text-to-image': {
    eyebrow: 'AI IMAGE GENERATOR',
    headline: 'Create images from a prompt.',
    description:
      'Describe what you want, choose a model, and generate your image in seconds.',
  },
  'image-to-image': {
    eyebrow: 'IMAGE TO IMAGE',
    headline: 'Transform any image with AI.',
    description:
      'Upload a reference image, describe the change, and create a new version.',
  },
} as const satisfies Record<
  InstantRamenGenerationMode,
  { eyebrow: string; headline: string; description: string }
>;

function GeneratorHeroContent({ mode }: { mode: InstantRamenGenerationMode }) {
  const copy = HERO_COPY[mode];

  return (
    <section
      data-ai-generator-hero
      className="px-4 py-12 sm:px-6 sm:py-16 lg:py-[4.5rem]"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-primary font-mono text-xs font-semibold tracking-[0.18em] uppercase">
          {copy.eyebrow}
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
          {copy.headline}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7 sm:text-lg">
          {copy.description}
        </p>
      </div>
    </section>
  );
}

function ModeAwareGeneratorHero() {
  const searchParams = useSearchParams();
  const mode: InstantRamenGenerationMode =
    searchParams.get('mode') === 'image-to-image'
      ? 'image-to-image'
      : 'text-to-image';

  return <GeneratorHeroContent mode={mode} />;
}

export function InstantRamenAiImageGeneratorHero() {
  return (
    <Suspense fallback={<GeneratorHeroContent mode="text-to-image" />}>
      <ModeAwareGeneratorHero />
    </Suspense>
  );
}
