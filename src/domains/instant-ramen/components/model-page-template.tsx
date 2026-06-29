import type { InstantRamenModelConfig } from '../content/types';

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border px-3 py-1 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function CtaLink({ href, label }: { href: string; label: string }) {
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

function ModelHeroCta({ model }: { model: InstantRamenModelConfig }) {
  if (model.allowGeneration) {
    return (
      <CtaLink
        href={`/ai-image-generator?model=${model.slug}`}
        label={`Generate with ${model.displayName}`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        {model.displayName} is coming soon. You can generate images now with
        GPT Image 2 or Nano Banana 2.
      </p>
      <div className="flex flex-wrap gap-3">
        <CtaLink href="/ai-image-generator?model=gpt-image-2" label="Use GPT Image 2" />
        <CtaLink href="/ai-image-generator?model=nano-banana" label="Use Nano Banana 2" />
      </div>
    </div>
  );
}

function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="rounded-3xl border p-8">
      <h2 className="text-3xl font-semibold">{title}</h2>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-sm leading-6 text-muted-foreground">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function InstantRamenModelPageTemplate({
  model,
}: {
  model: InstantRamenModelConfig;
}) {
  return (
    <main className="bg-background text-foreground">
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1fr_0.85fr] lg:py-24">
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            <Pill>{model.status}</Pill>
            <Pill>{model.provider}</Pill>
            <Pill>{model.creditCost} credits</Pill>
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-6xl">
            {model.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {model.heroDescription}
          </p>
          <div className="mt-8">
            <ModelHeroCta model={model} />
          </div>
        </div>

        <aside className="rounded-[2rem] border bg-muted/30 p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Model overview
          </p>
          <h2 className="mt-4 text-2xl font-semibold">{model.displayName}</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {model.shortDescription}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {model.supportedModes.map((mode) => (
              <Pill key={mode}>{mode}</Pill>
            ))}
            {model.aspectRatios.map((ratio) => (
              <Pill key={ratio}>{ratio}</Pill>
            ))}
          </div>
        </aside>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-6 pb-24">
        <section className="rounded-3xl border bg-muted/30 p-8">
          <p className="text-sm font-medium text-muted-foreground">Overview</p>
          <h2 className="mt-3 text-3xl font-semibold">
            {model.displayName} inside Instant Ramen
          </h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            {model.description}
          </p>
        </section>

        <ListSection title="Best For" items={model.bestFor} />
        <ListSection title="Features" items={model.features} />
        <ListSection title="Strengths" items={model.strengths} />
        <ListSection title="Limitations" items={model.limitations} />

        <section className="rounded-3xl border p-8">
          <h2 className="text-3xl font-semibold">Use Cases</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {model.useCases.map((useCase) => (
              <article
                key={useCase.title}
                className="rounded-2xl border bg-muted/30 p-5"
              >
                <h3 className="text-lg font-semibold">{useCase.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {useCase.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border p-8">
          <h2 className="text-3xl font-semibold">FAQ</h2>
          <div className="mt-6 space-y-4">
            {model.faq.map((item) => (
              <article key={item.question} className="rounded-2xl border p-5">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border bg-muted/30 p-8">
          <h2 className="text-3xl font-semibold">
            {model.allowGeneration
              ? `Generate with ${model.displayName}`
              : `${model.displayName} is coming soon`}
          </h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            {model.allowGeneration
              ? 'Start with the focused text-to-image entry. The full model-aware workspace will connect auth, credits, history, and provider execution in the product MVP.'
              : 'This page is kept as an SEO and product roadmap slot. Use GPT Image 2 or Nano Banana 2 for the current MVP generation flow.'}
          </p>
          <div className="mt-6">
            <ModelHeroCta model={model} />
          </div>
        </section>
      </section>
    </main>
  );
}
