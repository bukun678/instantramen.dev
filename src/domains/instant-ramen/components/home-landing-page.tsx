import Image from 'next/image';

import { instantRamenBrandConfig } from '../config/brand';
import {
  getInstantRamenModelArtwork,
  instantRamenArtwork,
} from '../content/artwork';
import { visibleInstantRamenModels } from '../content/models';
import { getInstantRamenPageContent } from '../content/pages';
import {
  buildInstantRamenFaqSchema,
  buildInstantRamenOrganizationSchema,
  buildInstantRamenWebApplicationSchema,
  buildInstantRamenWebSiteSchema,
} from '../content/structured-data';
import type { InstantRamenPageContentConfig } from '../content/types';
import { InstantRamenTextToImageMvp } from './text-to-image-mvp';

type HomeSection = NonNullable<
  InstantRamenPageContentConfig['sections']
>[number];

function JsonLdScript({ id, data }: { id: string; data: unknown }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function SectionHeading({
  section,
  className = '',
}: {
  section: HomeSection;
  className?: string;
}) {
  return (
    <div className={`max-w-3xl ${className}`}>
      {section.label ? (
        <p className="text-primary font-mono text-xs font-semibold tracking-[0.18em] uppercase">
          {section.label}
        </p>
      ) : null}
      <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">
        {section.title}
      </h2>
      <p className="text-muted-foreground mt-5 max-w-2xl text-base leading-7 sm:text-lg">
        {section.description}
      </p>
    </div>
  );
}

function ArrowLink({
  href,
  children,
  variant = 'solid',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'solid' | 'outline';
}) {
  return (
    <a
      href={href}
      className={
        variant === 'solid'
          ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-5 py-2.5 text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-offset-2'
          : 'bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-5 py-2.5 text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-white/30 dark:text-neutral-100'
      }
    >
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function HeroArtwork() {
  const [primary, secondary, tertiary] = instantRamenArtwork.hero;

  return (
    <div
      data-mobile-hero-artwork="primary-only"
      className="grid gap-3 md:grid-cols-[1.85fr_1fr] md:gap-4"
    >
      <figure
        data-hero-artwork="primary"
        className="group relative min-h-[330px] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 sm:min-h-[500px] lg:min-h-[640px]"
      >
        <Image
          src={primary.src}
          alt={primary.alt}
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 767px) 100vw, 64vw"
          className="object-cover transition duration-700 group-hover:scale-[1.015]"
        />
        <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-4 pt-16 pb-4 text-white sm:px-5 sm:pb-5">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-white/80 uppercase">
              {primary.label}
            </p>
            <p className="mt-1 text-sm font-semibold">{primary.category}</p>
          </div>
          <span className="font-mono text-xs text-white/80">16:9</span>
        </figcaption>
      </figure>

      <div className="hidden grid-cols-[1.15fr_0.85fr] gap-3 md:grid md:grid-cols-1 md:grid-rows-[1.15fr_0.85fr] md:gap-4">
        {[secondary, tertiary].map((artwork) => (
          <figure
            key={artwork.src}
            className="group relative min-h-[175px] overflow-hidden rounded-xl border border-white/10 bg-neutral-900 sm:min-h-[230px] md:min-h-0"
          >
            <Image
              src={artwork.src}
              alt={artwork.alt}
              fill
              sizes="(max-width: 767px) 50vw, 32vw"
              className="object-cover transition duration-700 group-hover:scale-[1.02]"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pt-12 pb-3 text-white sm:px-4 sm:pb-4">
              <p className="font-mono text-[10px] tracking-[0.14em] text-white/80 uppercase">
                {artwork.label}
              </p>
              <p className="mt-1 text-xs font-semibold sm:text-sm">
                {artwork.category}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function ModelShowcase({
  section,
  introduction,
}: {
  section: HomeSection;
  introduction?: HomeSection;
}) {
  return (
    <section
      id="models"
      className="scroll-mt-20 border-t px-4 py-20 sm:px-6 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {introduction ? (
          <div className="mb-16 grid gap-8 border-b pb-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <p className="text-primary font-mono text-xs font-semibold tracking-[0.18em] uppercase">
              {introduction.title}
            </p>
            <p className="text-foreground max-w-3xl text-xl leading-8 sm:text-2xl sm:leading-9">
              {introduction.description}
            </p>
          </div>
        ) : null}

        <SectionHeading section={section} />

        <div className="scrollbar-hide mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
          {visibleInstantRamenModels.map((model, index) => {
            const artwork = getInstantRamenModelArtwork(model.slug)[0];
            const isComingSoon = model.status === 'coming-soon';

            return (
              <article
                key={model.slug}
                data-model-layout={index === 0 ? 'featured' : 'supporting'}
                className={`group bg-card min-w-[82vw] snap-center overflow-hidden rounded-2xl border sm:min-w-[66vw] lg:min-w-0 ${
                  index === 0
                    ? 'lg:row-span-2'
                    : isComingSoon
                      ? 'bg-muted/35 border-dashed'
                      : ''
                }`}
              >
                <a
                  href={`/models/${model.slug}`}
                  className="focus-visible:ring-ring grid h-full focus-visible:ring-2 focus-visible:outline-none"
                >
                  <div
                    className={`relative overflow-hidden bg-neutral-950 ${
                      index === 0
                        ? 'min-h-[360px] lg:min-h-[504px]'
                        : 'min-h-[250px]'
                    }`}
                  >
                    <Image
                      src={artwork.src}
                      alt={artwork.alt}
                      fill
                      sizes={
                        index === 0
                          ? '(max-width: 1023px) 100vw, 50vw'
                          : '(max-width: 1023px) 100vw, 50vw'
                      }
                      className="object-cover transition duration-700 group-hover:scale-[1.02]"
                    />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <span className="rounded border border-white/25 bg-black/75 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] text-white uppercase">
                        {artwork.label}
                      </span>
                      {isComingSoon ? (
                        <span className="rounded border border-orange-300/40 bg-orange-500 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-black uppercase">
                          Coming Soon
                        </span>
                      ) : null}
                      {model.recommended ? (
                        <span className="rounded border border-white/15 bg-white px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-neutral-950 uppercase">
                          Recommended
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-6 p-5 sm:p-6">
                    <div>
                      <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase">
                        {model.allowGeneration
                          ? 'Available now'
                          : 'In development'}
                      </p>
                      <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.025em] sm:text-3xl">
                        {model.displayName}
                      </h3>
                      <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-6">
                        {model.shortDescription}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-2xl transition group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const galleryLayout = [
  'md:col-span-5 md:row-span-3',
  'md:col-span-3 md:row-span-2',
  'md:col-span-4 md:row-span-2',
  'md:col-span-3 md:row-span-2',
  'md:col-span-4 md:row-span-2',
  'md:col-span-5 md:row-span-2',
  'md:col-span-4 md:row-span-2',
  'md:col-span-3 md:row-span-2',
  'md:col-span-5 md:row-span-2',
  'md:col-span-4 md:row-span-2',
  'md:col-span-4 md:row-span-2',
  'md:col-span-4 md:row-span-2',
] as const;

function getArtworkPromptSummary(artwork: { alt: string; prompt?: string }) {
  const promptFragments = artwork.prompt
    ?.split(',')
    .map((fragment) => fragment.trim())
    .filter(Boolean);

  return promptFragments?.slice(0, 2).join(', ') || artwork.alt;
}

function ArtworkGallery({ section }: { section: HomeSection }) {
  return (
    <section className="instant-ramen-gallery scroll-mt-20 border-t px-4 py-20 text-neutral-50 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-semibold tracking-[0.18em] text-orange-400 uppercase">
            {section.label}
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">
            {section.title}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
            {section.description}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:hidden">
          {instantRamenArtwork.gallery.slice(0, 6).map((artwork, index) => (
            <figure
              key={artwork.src}
              className={`group overflow-hidden rounded-xl border border-white/10 bg-neutral-900 ${index === 0 ? 'col-span-2' : ''}`}
            >
              <div
                className={`relative ${index === 0 ? 'aspect-[16/10]' : 'aspect-[4/5]'}`}
              >
                <Image
                  src={artwork.src}
                  alt={artwork.alt}
                  fill
                  loading={index < 3 ? 'eager' : 'lazy'}
                  fetchPriority={index < 3 ? 'low' : 'auto'}
                  sizes={index === 0 ? '100vw' : '50vw'}
                  className="object-cover"
                />
              </div>
              <figcaption className="flex min-h-10 items-center justify-between gap-2 border-t border-white/10 px-3 py-2 text-[10px] text-white/80">
                <span className="truncate font-semibold">
                  {artwork.category}
                </span>
                <span className="shrink-0 font-mono text-[8px] tracking-[0.08em] text-white/70 uppercase">
                  Example creation
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div
          data-mobile-gallery="rail"
          className="scrollbar-hide mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:hidden"
        >
          {instantRamenArtwork.gallery.slice(6).map((artwork) => (
            <figure
              key={artwork.src}
              className="min-w-[72vw] snap-center overflow-hidden rounded-xl border border-white/10 bg-neutral-900"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={artwork.src}
                  alt={artwork.alt}
                  fill
                  sizes="72vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="flex min-h-10 items-center justify-between gap-2 border-t border-white/10 px-3 py-2 text-[10px] text-white/80">
                <span className="truncate font-semibold">
                  {artwork.category}
                </span>
                <span className="shrink-0 font-mono text-[8px] tracking-[0.08em] text-white/70 uppercase">
                  Example creation
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-12 hidden auto-rows-[112px] grid-cols-12 gap-3 md:grid lg:auto-rows-[138px]">
          {instantRamenArtwork.gallery.map((artwork, index) => (
            <figure
              key={artwork.src}
              tabIndex={0}
              className={`group relative overflow-hidden rounded-xl border border-white/10 bg-neutral-900 transition-[border-color,box-shadow] outline-none hover:border-orange-300/25 focus-visible:border-orange-300/70 focus-visible:ring-2 focus-visible:ring-orange-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${galleryLayout[index]}`}
            >
              <Image
                src={artwork.src}
                alt={artwork.alt}
                fill
                loading={index < 3 ? 'eager' : 'lazy'}
                fetchPriority={index < 3 ? 'low' : 'auto'}
                sizes="33vw"
                className="object-cover transition duration-700 group-hover:scale-[1.025]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-black/85 p-3 opacity-100 transition sm:p-4 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
                <div className="min-w-0">
                  <p className="font-mono text-[9px] tracking-[0.12em] text-white/75 uppercase">
                    Example creation · {artwork.category}
                  </p>
                  <p
                    data-gallery-prompt
                    className="mt-2 line-clamp-2 text-xs leading-5 text-white/90"
                  >
                    {getArtworkPromptSummary(artwork)}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflow({ section }: { section: HomeSection }) {
  return (
    <section className="border-t px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading section={section} />
        <ol className="mt-12 border-y">
          {section.steps?.map((step, index) => (
            <li
              key={step.title}
              className="grid gap-4 border-b py-7 last:border-b-0 sm:grid-cols-[5rem_0.8fr_1.2fr] sm:items-start"
            >
              <span className="text-primary font-mono text-sm">
                0{index + 1}
              </span>
              <h3 className="text-xl font-extrabold tracking-[-0.02em]">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-6 sm:text-base">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Advantages({
  features,
  useCases,
}: {
  features: HomeSection;
  useCases: HomeSection;
}) {
  return (
    <section className="border-t px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading section={features} />
        <div className="mt-12 grid border-t sm:grid-cols-2 lg:grid-cols-3">
          {features.items?.slice(0, 6).map((item, index) => (
            <article
              key={item.title}
              className="border-r border-b p-6 first:border-l sm:p-8"
            >
              <span className="text-primary font-mono text-xs">
                0{index + 1}
              </span>
              <h3 className="mt-7 text-xl font-extrabold tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading section={useCases} />
          <div className="grid gap-x-10 sm:grid-cols-2">
            {useCases.items?.map((item) => (
              <article key={item.title} className="border-t py-5">
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq({ section }: { section: HomeSection }) {
  return (
    <section className="border-t px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr]">
        <SectionHeading section={section} />
        <div className="border-t">
          {section.faq?.map((item) => (
            <details key={item.question} className="group border-b">
              <summary className="focus-visible:ring-ring flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-bold focus-visible:ring-2 focus-visible:outline-none sm:text-lg">
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
  );
}

export function InstantRamenHomeLandingPage() {
  const content = getInstantRamenPageContent('home');
  const sections = content.sections ?? [];
  const section = (id: string) =>
    sections.find((currentSection) => currentSection.id === id);
  const whatSection = section('what-is-instant-ramen');
  const modelsSection = section('supported-models');
  const gallerySection = section('examples');
  const workflowSection = section('how-it-works');
  const featuresSection = section('key-features');
  const useCasesSection = section('use-cases');
  const faqSection = section('faq');
  const finalCtaSection = section('final-cta');
  const faqItems = faqSection?.faq ?? [];

  return (
    <main className="instant-ramen-surface bg-background text-foreground overflow-x-clip">
      <JsonLdScript
        id="instant-ramen-organization-schema"
        data={buildInstantRamenOrganizationSchema()}
      />
      <JsonLdScript
        id="instant-ramen-website-schema"
        data={buildInstantRamenWebSiteSchema()}
      />
      <JsonLdScript
        id="instant-ramen-webapplication-schema"
        data={buildInstantRamenWebApplicationSchema()}
      />
      <JsonLdScript
        id="instant-ramen-faq-schema"
        data={buildInstantRamenFaqSchema(faqItems)}
      />

      <section className="px-4 pt-24 pb-10 sm:px-6 sm:pt-30 lg:pt-28 lg:pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-primary font-mono text-xs font-semibold tracking-[0.2em] uppercase">
              {instantRamenBrandConfig.productName} · AI image generator
            </p>
            <h1 className="mt-5 text-5xl font-extrabold tracking-[-0.045em] text-balance sm:text-6xl lg:text-[5.625rem] lg:leading-[0.98]">
              {content.headline}
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg dark:text-neutral-200">
              {content.summary}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ArrowLink href="#generator">Create an image</ArrowLink>
              <ArrowLink href="#models" variant="outline">
                Explore models
              </ArrowLink>
            </div>
          </div>
          <div className="mt-9 sm:mt-10 lg:mt-10">
            <HeroArtwork />
          </div>
        </div>
      </section>

      <section
        id="generator"
        className="scroll-mt-20 border-t px-4 py-16 sm:px-6 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-5 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-primary font-mono text-xs font-semibold tracking-[0.18em] uppercase">
                Create now
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
                From prompt to image.
              </h2>
            </div>
            <p className="text-muted-foreground max-w-md text-sm leading-6">
              Choose GPT Image 2 or Nano Banana 2. Instant Ramen remains visible
              as a Coming Soon model and cannot be selected yet.
            </p>
          </div>
          <InstantRamenTextToImageMvp />
        </div>
      </section>

      {modelsSection ? (
        <ModelShowcase section={modelsSection} introduction={whatSection} />
      ) : null}
      {gallerySection ? <ArtworkGallery section={gallerySection} /> : null}
      {workflowSection ? <Workflow section={workflowSection} /> : null}
      {featuresSection && useCasesSection ? (
        <Advantages features={featuresSection} useCases={useCasesSection} />
      ) : null}
      {faqSection ? <Faq section={faqSection} /> : null}

      {finalCtaSection ? (
        <section className="instant-ramen-final-cta px-4 py-20 text-neutral-50 sm:px-6 lg:py-28">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-semibold tracking-[0.18em] text-orange-400 uppercase">
                {finalCtaSection.label}
              </p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-balance sm:text-6xl">
                {finalCtaSection.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-400">
                {finalCtaSection.description}
              </p>
            </div>
            <a
              href="#generator"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-orange-500 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-orange-400 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none"
            >
              Start generating
              <span aria-hidden="true">↑</span>
            </a>
          </div>
        </section>
      ) : null}
    </main>
  );
}
