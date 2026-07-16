import Image from 'next/image';

import { Link } from '@/core/i18n/navigation';

import { getInstantRamenModelArtwork } from '../content/artwork';
import { visibleInstantRamenModels } from '../content/models';
import {
  buildInstantRamenBreadcrumbSchema,
  buildInstantRamenFaqSchema,
} from '../content/structured-data';
import type { InstantRamenModelConfig } from '../content/types';

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function StatusLabel({ model }: { model: InstantRamenModelConfig }) {
  const isAvailable = model.allowGeneration;

  return (
    <span
      className={`inline-flex min-h-8 items-center rounded border px-3 py-1 font-mono text-[10px] font-bold tracking-[0.14em] uppercase ${
        isAvailable
          ? 'border-emerald-700/30 bg-emerald-500/10 text-emerald-800 dark:border-emerald-300/25 dark:text-emerald-300'
          : 'border-orange-700/30 bg-orange-500/10 text-orange-800 dark:border-orange-300/25 dark:text-orange-300'
      }`}
    >
      {isAvailable ? 'Available now' : 'Coming Soon'}
    </span>
  );
}

function PrimaryCta({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="border-primary bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-5 py-2.5 text-sm font-black transition focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

function SecondaryCta({
  href,
  children,
  inverse = false,
}: {
  href: string;
  children: React.ReactNode;
  inverse?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`focus-visible:ring-ring inline-flex min-h-11 items-center justify-center rounded-md border px-5 py-2.5 text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-offset-2 ${
        inverse
          ? 'border-white bg-white text-neutral-950 hover:bg-neutral-200'
          : 'bg-background hover:bg-muted'
      }`}
    >
      {children}
    </Link>
  );
}

function ModelHeroCta({
  model,
  onDark = false,
}: {
  model: InstantRamenModelConfig;
  onDark?: boolean;
}) {
  if (model.allowGeneration) {
    return (
      <PrimaryCta href={`/ai-image-generator?model=${model.slug}`}>
        Create with {model.displayName}
      </PrimaryCta>
    );
  }

  return (
    <div>
      <p
        className={`max-w-xl text-sm leading-6 ${onDark ? 'text-neutral-300' : 'text-muted-foreground'}`}
      >
        Instant Ramen is not available for generation yet. Create now with one
        of the two available models.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryCta href="/ai-image-generator?model=gpt-image-2">
          Use GPT Image 2
        </PrimaryCta>
        <SecondaryCta
          href="/ai-image-generator?model=nano-banana"
          inverse={onDark}
        >
          Use Nano Banana 2
        </SecondaryCta>
      </div>
    </div>
  );
}

function TextList({
  title,
  eyebrow,
  items,
}: {
  title: string;
  eyebrow: string;
  items: string[];
}) {
  return (
    <section className="border-t pt-10">
      <p className="text-primary font-mono text-xs font-semibold tracking-[0.16em] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
        {title}
      </h2>
      <ul className="mt-8 divide-y border-y">
        {items.map((item, index) => (
          <li
            key={item}
            className="grid gap-3 py-5 sm:grid-cols-[3rem_1fr] sm:items-start"
          >
            <span className="text-primary font-mono text-xs">0{index + 1}</span>
            <span className="text-muted-foreground text-sm leading-6 sm:text-base">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function InstantRamenModelPageTemplate({
  model,
}: {
  model: InstantRamenModelConfig;
}) {
  const artwork = getInstantRamenModelArtwork(model.slug);
  const relatedModels = visibleInstantRamenModels.filter(
    (candidate) => candidate.slug !== model.slug
  );
  const isComingSoon = model.status === 'coming-soon';

  return (
    <main className="instant-ramen-surface bg-background text-foreground overflow-x-clip">
      <JsonLd
        data={buildInstantRamenBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Models', path: '/models' },
          { name: model.displayName, path: `/models/${model.slug}` },
        ])}
      />
      <JsonLd data={buildInstantRamenFaqSchema(model.faq)} />

      <section className="px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:pt-36 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="text-muted-foreground mb-10 flex flex-wrap items-center gap-2 font-mono text-xs"
          >
            <Link
              href="/"
              className="hover:text-foreground min-h-11 content-center"
            >
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/models"
              className="hover:text-foreground min-h-11 content-center"
            >
              Models
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-foreground">
              {model.displayName}
            </span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <StatusLabel model={model} />
                <span className="text-muted-foreground font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Text to image
                </span>
              </div>
              <h1 className="mt-7 text-5xl font-black tracking-[-0.06em] text-balance sm:text-6xl lg:text-7xl">
                {model.heroTitle}
              </h1>
              <p className="text-muted-foreground mt-6 max-w-2xl text-base leading-7 sm:text-lg">
                {model.heroDescription}
              </p>
              <div className="mt-8">
                <ModelHeroCta model={model} />
              </div>
            </div>

            <figure className="relative min-h-[350px] overflow-hidden rounded-xl border border-white/10 bg-neutral-950 sm:min-h-[500px] lg:min-h-[620px]">
              <Image
                src={artwork[0].src}
                alt={artwork[0].alt}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 58vw"
                className="object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-black/75 p-4 text-white sm:p-5">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-white/60 uppercase">
                    {artwork[0].label}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {artwork[0].category}
                  </p>
                </div>
                <span className="font-mono text-xs text-white/55">16:9</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="border-t px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-primary font-mono text-xs font-semibold tracking-[0.16em] uppercase">
              Overview
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              What is {model.displayName}?
            </h2>
          </div>
          <div>
            <p className="text-foreground text-xl leading-8 sm:text-2xl sm:leading-9">
              {model.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {model.aspectRatios.map((ratio) => (
                <span
                  key={ratio}
                  className="text-muted-foreground rounded border px-2.5 py-1 font-mono text-[10px]"
                >
                  {ratio}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-950 px-4 py-16 text-neutral-50 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-orange-400 uppercase">
              {isComingSoon ? 'Concept previews' : 'Creative examples'}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              {isComingSoon
                ? 'A visual direction, not a model result.'
                : `Ideas for ${model.displayName}.`}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">
              {isComingSoon
                ? 'These images are labeled as concepts because the Instant Ramen model is not available.'
                : 'These original examples show useful visual directions without claiming model benchmarks or guaranteed output.'}
            </p>
          </div>
          <div className="mt-10 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
            {artwork.slice(1).map((item, index) => (
              <figure
                key={item.src}
                className={`relative min-h-[320px] overflow-hidden rounded-lg border border-white/10 bg-neutral-900 ${
                  index === 0 ? 'md:min-h-[560px]' : 'md:min-h-[560px]'
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className="object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-black/75 p-4">
                  <p className="font-mono text-[10px] tracking-[0.14em] text-white/60 uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{item.category}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
          <TextList
            title="Where it fits best"
            eyebrow="Best for"
            items={model.bestFor}
          />
          <TextList
            title="What the model offers"
            eyebrow="Features"
            items={model.features}
          />
          <TextList
            title="Useful strengths"
            eyebrow="Strengths"
            items={model.strengths}
          />
          <TextList
            title="What to keep in mind"
            eyebrow="Limitations"
            items={model.limitations}
          />
        </div>
      </section>

      <section className="border-t px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-primary font-mono text-xs font-semibold tracking-[0.16em] uppercase">
                How to use it
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                From prompt to image in three steps.
              </h2>
            </div>
            <ol className="border-t">
              {model.howTo.map((step, index) => (
                <li
                  key={step.title}
                  className="grid gap-4 border-b py-6 sm:grid-cols-[3rem_0.8fr_1.2fr]"
                >
                  <span className="text-primary font-mono text-xs">
                    0{index + 1}
                  </span>
                  <h3 className="font-black">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-6">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-t px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-primary font-mono text-xs font-semibold tracking-[0.16em] uppercase">
                Model differences
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                Choose by workflow, not hype.
              </h2>
            </div>
            <p className="text-foreground text-xl leading-8 sm:text-2xl sm:leading-9">
              {model.difference}
            </p>
          </div>

          <div className="bg-border mt-14 grid gap-px overflow-hidden rounded-lg border md:grid-cols-2">
            {model.useCases.map((useCase) => (
              <article key={useCase.title} className="bg-background p-6 sm:p-8">
                <h3 className="text-xl font-black tracking-[-0.02em]">
                  {useCase.title}
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-6">
                  {useCase.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-primary font-mono text-xs font-semibold tracking-[0.16em] uppercase">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Questions about {model.displayName}.
            </h2>
          </div>
          <div className="border-t">
            {model.faq.map((item) => (
              <details key={item.question} className="group border-b">
                <summary className="focus-visible:ring-ring flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 py-5 font-bold focus-visible:ring-2 focus-visible:outline-none">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="text-primary font-mono text-xl transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="text-muted-foreground max-w-2xl pb-6 text-sm leading-7 sm:text-base">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-primary font-mono text-xs font-semibold tracking-[0.16em] uppercase">
            Related models
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Keep exploring.
          </h2>
          <div className="bg-border mt-10 grid gap-px overflow-hidden rounded-lg border md:grid-cols-2">
            {relatedModels.map((relatedModel) => (
              <Link
                key={relatedModel.slug}
                href={`/models/${relatedModel.slug}`}
                className="group bg-background hover:bg-muted p-6 transition sm:p-8"
              >
                <span className="text-muted-foreground font-mono text-[10px] tracking-[0.12em] uppercase">
                  {relatedModel.allowGeneration
                    ? 'Available now'
                    : 'Coming Soon'}
                </span>
                <div className="mt-3 flex items-end justify-between gap-5">
                  <h3 className="text-2xl font-black tracking-[-0.03em]">
                    {relatedModel.displayName}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="transition group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
                <p className="text-muted-foreground mt-3 text-sm leading-6">
                  {relatedModel.shortDescription}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-950 px-4 py-20 text-neutral-50 sm:px-6 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-orange-400 uppercase">
              {model.allowGeneration ? 'Create now' : 'Available alternatives'}
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-balance sm:text-5xl">
              {model.allowGeneration
                ? `Turn a prompt into an image with ${model.displayName}.`
                : 'Create while Instant Ramen is in development.'}
            </h2>
          </div>
          <div className="shrink-0">
            <ModelHeroCta model={model} onDark />
          </div>
        </div>
      </section>
    </main>
  );
}
