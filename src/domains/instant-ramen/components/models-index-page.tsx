import { instantRamenBrandConfig } from '../config/brand';
import {
  availableInstantRamenModels,
  comingSoonInstantRamenModels,
} from '../content/models';
import type { InstantRamenModelConfig } from '../content/types';

function ModelCard({ model }: { model: InstantRamenModelConfig }) {
  return (
    <a
      href={`/models/${model.slug}`}
      className="rounded-3xl border bg-muted/20 p-6 transition hover:bg-muted/50"
    >
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
          {model.status}
        </span>
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
          {model.provider}
        </span>
      </div>
      <h3 className="mt-5 text-2xl font-semibold">{model.displayName}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {model.shortDescription}
      </p>
      <p className="mt-5 text-sm font-medium">View model →</p>
    </a>
  );
}

function ModelGroup({
  title,
  description,
  models,
}: {
  title: string;
  description: string;
  models: InstantRamenModelConfig[];
}) {
  return (
    <section className="rounded-3xl border p-8">
      <h2 className="text-3xl font-semibold">{title}</h2>
      <p className="mt-4 max-w-3xl text-muted-foreground">{description}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <ModelCard key={model.slug} model={model} />
        ))}
      </div>
    </section>
  );
}

export function InstantRamenModelsIndexPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:py-24">
        <p className="mb-5 inline-flex rounded-full border px-4 py-2 text-sm text-muted-foreground">
          {instantRamenBrandConfig.productName} Models
        </p>
        <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-6xl">
          AI image models for a multi-model platform
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          Explore available and coming soon models inside{' '}
          {instantRamenBrandConfig.productName}. This index is data-driven: new
          model pages should come from model configuration, not copied page
          templates.
        </p>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-6 pb-24">
        <ModelGroup
          title="Available Models"
          description="Models positioned as available options for Instant Ramen image generation and editing workflows."
          models={availableInstantRamenModels}
        />
        <ModelGroup
          title="Coming Soon Models"
          description="Reserved model pages for future Instant Ramen-native capabilities."
          models={comingSoonInstantRamenModels}
        />
      </section>
    </main>
  );
}
