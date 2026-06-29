import { instantRamenBrandConfig } from '../config/brand';
import { getInstantRamenPageContent } from '../content/pages';
import {
  buildInstantRamenFaqSchema,
  buildInstantRamenOrganizationSchema,
  buildInstantRamenWebApplicationSchema,
  buildInstantRamenWebSiteSchema,
} from '../content/structured-data';
import type { InstantRamenPageContentConfig } from '../content/types';
import { InstantRamenTextToImageMvp } from './text-to-image-mvp';

type HomeSection = NonNullable<InstantRamenPageContentConfig['sections']>[number];

function JsonLdScript({ id, data }: { id: string; data: unknown }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function SectionHeading({ section }: { section: HomeSection }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {section.label && (
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          {section.label}
        </p>
      )}
      <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
        {section.title}
      </h2>
      <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
        {section.description}
      </p>
    </div>
  );
}

function CardGrid({ section }: { section: HomeSection }) {
  if (!section.items?.length) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {section.items.map((item) => {
        const card = (
          <div className="h-full rounded-3xl border bg-muted/20 p-6 transition-colors hover:bg-muted/30">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              {item.badge && (
                <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                  {item.badge}
                </span>
              )}
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </div>
        );

        return item.href ? (
          <a key={item.title} href={item.href} className="block">
            {card}
          </a>
        ) : (
          <div key={item.title}>{card}</div>
        );
      })}
    </div>
  );
}

function ExampleGrid({ section }: { section: HomeSection }) {
  if (!section.items?.length) {
    return null;
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {section.items.map((item, index) => (
        <div key={item.title} className="overflow-hidden rounded-3xl border bg-muted/20">
          <div className="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.28),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(120,53,15,0.78))] p-6 text-center">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">
                Example {String(index + 1).padStart(2, '0')}
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {item.title}
              </p>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepGrid({ section }: { section: HomeSection }) {
  if (!section.steps?.length) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {section.steps.map((step, index) => (
        <div key={step.title} className="rounded-3xl border bg-muted/20 p-6">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {index + 1}
          </div>
          <h3 className="text-xl font-semibold">{step.title}</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function FaqList({ section }: { section: HomeSection }) {
  if (!section.faq?.length) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl divide-y rounded-3xl border bg-muted/10">
      {section.faq.map((item) => (
        <div key={item.question} className="p-6">
          <h3 className="text-lg font-semibold">{item.question}</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {item.answer}
          </p>
        </div>
      ))}
    </div>
  );
}

function HomeSeoSection({ section }: { section: HomeSection }) {
  return (
    <section id={section.id} className="mx-auto w-full max-w-7xl px-6 py-16 md:py-20">
      <SectionHeading section={section} />
      {section.id === 'examples' ? (
        <ExampleGrid section={section} />
      ) : section.steps ? (
        <StepGrid section={section} />
      ) : section.faq ? (
        <FaqList section={section} />
      ) : (
        <CardGrid section={section} />
      )}
      {section.cta && (
        <div className="mt-10 text-center">
          <a
            href={section.cta.href}
            className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {section.cta.label}
          </a>
        </div>
      )}
    </section>
  );
}

export function InstantRamenHomeLandingPage() {
  const content = getInstantRamenPageContent('home');
  const sections = content.sections ?? [];
  const seoSections = sections.filter((section) => section.id !== 'hero');
  const faqSection = sections.find((section) => section.id === 'faq');
  const faqItems = faqSection?.faq ?? [];

  return (
    <main className="bg-background text-foreground">
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
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div>
          <p className="mb-5 inline-flex rounded-full border px-4 py-2 text-sm text-muted-foreground">
            {instantRamenBrandConfig.productName} · Text to Image
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
            Generate images with GPT Image 2 or Nano Banana 2
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {content.summary}
          </p>
          <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="rounded-2xl border bg-muted/30 p-4">
              Prompt in
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4">
              Pick model
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4">
              Image out
            </div>
          </div>
        </div>

        <InstantRamenTextToImageMvp />
      </section>

      {seoSections.map((section) => (
        <HomeSeoSection key={section.id} section={section} />
      ))}
    </main>
  );
}
