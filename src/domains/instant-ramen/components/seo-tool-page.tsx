import { instantRamenBrandConfig } from '../config/brand';
import type { InstantRamenRouteKey } from '../config/routes';
import { getInstantRamenPageContent } from '../content/pages';
import { InstantRamenTextToImageMvp } from './text-to-image-mvp';

function ArrowLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="border-primary bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex min-h-11 items-center justify-center rounded-md border px-5 py-2.5 text-sm font-black transition focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {label}
      <span aria-hidden="true" className="ml-2">
        →
      </span>
    </a>
  );
}

export function InstantRamenSeoToolPage({
  routeKey,
}: {
  routeKey: Extract<InstantRamenRouteKey, 'aiImageGenerator' | 'aiImageEditor'>;
}) {
  const content = getInstantRamenPageContent(routeKey);
  const sections = content.sections ?? [];
  const hero = sections.find((section) => section.id === 'hero');
  const restSections = sections
    .filter((section) => section.id !== 'hero')
    .slice(0, routeKey === 'aiImageGenerator' ? 2 : 4);

  if (routeKey === 'aiImageGenerator') {
    return (
      <main className="instant-ramen-surface bg-background text-foreground overflow-x-clip">
        <section className="px-4 pt-28 pb-12 sm:px-6 sm:pt-32 lg:pt-36 lg:pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-4xl">
              {content.eyebrow ? (
                <p className="text-primary font-mono text-xs font-semibold tracking-[0.18em] uppercase">
                  {content.eyebrow}
                </p>
              ) : null}
              <h1 className="mt-5 text-5xl font-black tracking-[-0.06em] text-balance sm:text-6xl lg:text-7xl">
                {content.headline}
              </h1>
              <p className="text-muted-foreground mt-6 max-w-2xl text-base leading-7 sm:text-lg">
                {content.summary}
              </p>
            </div>
          </div>
        </section>

        <section
          id="generator"
          className="scroll-mt-20 border-t px-4 py-12 sm:px-6 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <InstantRamenTextToImageMvp compact />
          </div>
        </section>

        <section className="border-t px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-7xl space-y-16">
            {restSections.map((section) => (
              <section
                key={section.id}
                className="grid gap-8 border-b pb-16 last:border-b-0 last:pb-0 lg:grid-cols-[0.72fr_1.28fr]"
              >
                <div>
                  {section.label ? (
                    <p className="text-primary font-mono text-xs font-semibold tracking-[0.16em] uppercase">
                      {section.label}
                    </p>
                  ) : null}
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                    {section.title}
                  </h2>
                </div>
                <div>
                  <p className="text-muted-foreground max-w-2xl text-base leading-7">
                    {section.description}
                  </p>
                  {section.items ? (
                    <div className="mt-8 divide-y border-y">
                      {section.items.map((item, index) => (
                        <article
                          key={item.title}
                          className="grid gap-3 py-5 sm:grid-cols-[3rem_0.7fr_1.3fr]"
                        >
                          <span className="text-primary font-mono text-xs">
                            0{index + 1}
                          </span>
                          <h3 className="font-black">{item.title}</h3>
                          <p className="text-muted-foreground text-sm leading-6">
                            {item.description}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="instant-ramen-surface bg-background text-foreground">
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1fr_0.9fr] lg:py-24">
        <div>
          {content.eyebrow && (
            <p className="text-muted-foreground mb-5 inline-flex rounded-full border px-4 py-2 text-sm">
              {content.eyebrow}
            </p>
          )}
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-6xl">
            {content.headline}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
            {content.summary}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {content.primaryCta && (
              <ArrowLink
                href={content.primaryCta.href}
                label={content.primaryCta.label}
              />
            )}
            {content.secondaryCta && (
              <a
                href={content.secondaryCta.href}
                className="hover:bg-muted inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-medium transition"
              >
                {content.secondaryCta.label}
              </a>
            )}
          </div>
        </div>

        <aside className="bg-muted/30 rounded-[2rem] border p-5 shadow-sm">
          <div className="bg-background rounded-[1.5rem] border p-6">
            <p className="text-muted-foreground text-sm font-medium">
              {instantRamenBrandConfig.productName} tool preview
            </p>
            <div className="mt-6 space-y-4">
              {(
                hero?.items ?? [
                  {
                    title: 'Source image',
                    description: 'Start from an existing image.',
                  },
                  {
                    title: 'Model',
                    description:
                      'Choose model capabilities through a provider-ready layer.',
                  },
                  {
                    title: 'Result',
                    description:
                      'Review outputs later in the Create workspace.',
                  },
                ]
              ).map((item) => (
                <div
                  key={item.title}
                  className="bg-muted/40 rounded-2xl border p-4"
                >
                  <h2 className="text-sm font-semibold">{item.title}</h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-6 pb-24">
        {hero && (
          <section className="bg-muted/30 rounded-3xl border p-8">
            {hero.label && (
              <p className="text-muted-foreground text-sm font-medium">
                {hero.label}
              </p>
            )}
            <h2 className="mt-3 text-3xl font-semibold">{hero.title}</h2>
            <p className="text-muted-foreground mt-4 max-w-3xl">
              {hero.description}
            </p>
            {hero.cta && (
              <div className="mt-6">
                <ArrowLink href={hero.cta.href} label={hero.cta.label} />
              </div>
            )}
          </section>
        )}

        {restSections.map((section) => (
          <section key={section.id} className="rounded-3xl border p-8">
            {section.label && (
              <p className="text-muted-foreground text-sm font-medium">
                {section.label}
              </p>
            )}
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold">{section.title}</h2>
                <p className="text-muted-foreground mt-4 max-w-3xl">
                  {section.description}
                </p>
              </div>
              {section.cta && (
                <div className="shrink-0">
                  <ArrowLink
                    href={section.cta.href}
                    label={section.cta.label}
                  />
                </div>
              )}
            </div>

            {section.items && (
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {section.items.map((item) => (
                  <article
                    key={item.title}
                    className="bg-muted/30 rounded-2xl border p-5"
                  >
                    {item.badge && (
                      <span className="text-muted-foreground mb-4 inline-flex rounded-full border px-3 py-1 text-xs">
                        {item.badge}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground mt-3 text-sm leading-6">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            )}

            {section.steps && (
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {section.steps.map((step, index) => (
                  <article key={step.title} className="rounded-2xl border p-5">
                    <span className="text-muted-foreground text-sm">
                      Step {index + 1}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground mt-3 text-sm leading-6">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            )}

            {section.faq && (
              <div className="mt-8 space-y-4">
                {section.faq.map((item) => (
                  <article
                    key={item.question}
                    className="rounded-2xl border p-5"
                  >
                    <h3 className="font-semibold">{item.question}</h3>
                    <p className="text-muted-foreground mt-3 text-sm leading-6">
                      {item.answer}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
      </section>
    </main>
  );
}
