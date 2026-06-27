import { instantRamenBrandConfig } from '../config/brand';
import type { InstantRamenRouteKey } from '../config/routes';
import { getInstantRamenPageContent } from '../content/pages';

function ArrowLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
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
  const restSections = sections.filter((section) => section.id !== 'hero');

  return (
    <main className="bg-background text-foreground">
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1fr_0.9fr] lg:py-24">
        <div>
          {content.eyebrow && (
            <p className="mb-5 inline-flex rounded-full border px-4 py-2 text-sm text-muted-foreground">
              {content.eyebrow}
            </p>
          )}
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-6xl">
            {content.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
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
                className="inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-medium transition hover:bg-muted"
              >
                {content.secondaryCta.label}
              </a>
            )}
          </div>
        </div>

        <aside className="rounded-[2rem] border bg-muted/30 p-5 shadow-sm">
          <div className="rounded-[1.5rem] border bg-background p-6">
            <p className="text-sm font-medium text-muted-foreground">
              {instantRamenBrandConfig.productName} tool preview
            </p>
            <div className="mt-6 space-y-4">
              {(hero?.items ?? [
                {
                  title:
                    routeKey === 'aiImageGenerator'
                      ? 'Prompt'
                      : 'Source image',
                  description:
                    routeKey === 'aiImageGenerator'
                      ? 'Describe the image you want to create.'
                      : 'Start from an existing image.',
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
              ]).map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border bg-muted/40 p-4"
                >
                  <h2 className="text-sm font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
          <section className="rounded-3xl border bg-muted/30 p-8">
            {hero.label && (
              <p className="text-sm font-medium text-muted-foreground">
                {hero.label}
              </p>
            )}
            <h2 className="mt-3 text-3xl font-semibold">{hero.title}</h2>
            <p className="mt-4 max-w-3xl text-muted-foreground">
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
              <p className="text-sm font-medium text-muted-foreground">
                {section.label}
              </p>
            )}
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold">{section.title}</h2>
                <p className="mt-4 max-w-3xl text-muted-foreground">
                  {section.description}
                </p>
              </div>
              {section.cta && (
                <div className="shrink-0">
                  <ArrowLink href={section.cta.href} label={section.cta.label} />
                </div>
              )}
            </div>

            {section.items && (
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {section.items.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border bg-muted/30 p-5"
                  >
                    {item.badge && (
                      <span className="mb-4 inline-flex rounded-full border px-3 py-1 text-xs text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
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
                    <span className="text-sm text-muted-foreground">
                      Step {index + 1}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            )}

            {section.faq && (
              <div className="mt-8 space-y-4">
                {section.faq.map((item) => (
                  <article key={item.question} className="rounded-2xl border p-5">
                    <h3 className="font-semibold">{item.question}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
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
