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
      <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-balance sm:text-4xl lg:text-5xl">
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
          : 'bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-5 py-2.5 text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-offset-2'
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
    <div className="grid gap-3 md:grid-cols-[1.8fr_1fr]">
      <figure className="group relative min-h-[320px] overflow-hidden rounded-xl border border-white/10 bg-neutral-950 sm:min-h-[480px] lg:min-h-[620px]">
        <Image
          src={primary.src}
          alt={primary.alt}
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 767px) 100vw, 64vw"
          className="object-cover transition duration-700 group-hover:scale-[1.015]"
        />
        <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-black/70 p-4 text-white sm:p-5">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-white/65 uppercase">
              {primary.label}
            </p>
            <p className="mt-1 text-sm font-semibold">{primary.category}</p>
          </div>
          <span className="font-mono text-xs text-white/65">16:9</span>
        </figcaption>
      </figure>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
        {[secondary, tertiary].map((artwork) => (
          <figure
            key={artwork.src}
            className="group relative min-h-[170px] overflow-hidden rounded-xl border border-white/10 bg-neutral-950 sm:min-h-[230px] md:min-h-0"
          >
            <Image
              src={artwork.src}
              alt={artwork.alt}
              fill
              sizes="(max-width: 767px) 50vw, 32vw"
              className="object-cover transition duration-700 group-hover:scale-[1.02]"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-black/70 p-3 text-white sm:p-4">
              <p className="font-mono text-[10px] tracking-[0.14em] text-white/60 uppercase">
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
    <section id="models" className="border-t px-4 py-20 sm:px-6 lg:py-28">
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

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {visibleInstantRamenModels.map((model, index) => {
            const artwork = getInstantRamenModelArtwork(model.slug)[0];
            const isComingSoon = model.status === 'coming-soon';

            return (
              <article
                key={model.slug}
                className={`group bg-card overflow-hidden rounded-xl border ${
                  index === 0 ? 'lg:row-span-2' : ''
                }`}
              >
                <a
                  href={`/models/${model.slug}`}
                  className="focus-visible:ring-ring grid h-full focus-visible:ring-2 focus-visible:outline-none"
                >
                  <div
                    className={`relative overflow-hidden bg-neutral-950 ${
                      index === 0
                        ? 'min-h-[360px] lg:min-h-[560px]'
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
                      <span className="rounded border border-white/15 bg-black/70 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] text-white uppercase">
                        {artwork.label}
                      </span>
                      {isComingSoon ? (
                        <span className="rounded border border-orange-300/40 bg-orange-500 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-black uppercase">
                          Coming Soon
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
                      <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
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
  'col-span-1 row-span-2 md:col-span-4',
  'col-span-1 row-span-1 md:col-span-3',
  'col-span-2 row-span-1 md:col-span-5',
  'col-span-1 row-span-2 md:col-span-3',
  'col-span-1 row-span-1 md:col-span-4',
  'col-span-1 row-span-1 md:col-span-5',
  'col-span-1 row-span-2 md:col-span-4',
  'col-span-1 row-span-1 md:col-span-8',
] as const;

function ArtworkGallery({ section }: { section: HomeSection }) {
  return (
    <section className="border-t bg-neutral-950 px-4 py-20 text-neutral-50 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-semibold tracking-[0.18em] text-orange-400 uppercase">
            {section.label}
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-balance sm:text-4xl lg:text-5xl">
            {section.title}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg">
            {section.description}
          </p>
        </div>

        <div className="mt-12 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] md:auto-rows-[170px] md:grid-cols-12">
          {instantRamenArtwork.gallery.map((artwork, index) => (
            <figure
              key={artwork.src}
              className={`group relative overflow-hidden rounded-lg border border-white/10 bg-neutral-900 ${galleryLayout[index]}`}
            >
              <Image
                src={artwork.src}
                alt={artwork.alt}
                fill
                sizes="(max-width: 767px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-[1.025]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-black/75 p-3 opacity-100 transition sm:p-4 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.12em] text-white/55 uppercase">
                    {artwork.label}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white">
                    {artwork.category}
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
              <h3 className="text-xl font-black tracking-[-0.02em]">
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
              <h3 className="mt-7 text-xl font-black tracking-[-0.02em]">
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

      <section className="px-4 pt-28 pb-12 sm:px-6 sm:pt-32 lg:pt-36 lg:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-primary font-mono text-xs font-semibold tracking-[0.2em] uppercase">
              {instantRamenBrandConfig.productName} · AI image generator
            </p>
            <h1 className="mt-5 text-5xl font-black tracking-[-0.06em] text-balance sm:text-6xl lg:text-8xl">
              {content.headline}
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg">
              {content.summary}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ArrowLink href="#generator">Create an image</ArrowLink>
              <ArrowLink href="#models" variant="outline">
                Explore models
              </ArrowLink>
            </div>
          </div>
          <div className="mt-12 lg:mt-16">
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
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
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
        <section className="bg-neutral-950 px-4 py-20 text-neutral-50 sm:px-6 lg:py-28">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-semibold tracking-[0.18em] text-orange-400 uppercase">
                {finalCtaSection.label}
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-balance sm:text-6xl">
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
