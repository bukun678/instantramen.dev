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
      className="bg-muted/20 hover:bg-muted/50 rounded-3xl border p-6 transition"
    >
      <div className="flex flex-wrap gap-2">
        <span className="text-muted-foreground rounded-full border px-3 py-1 text-xs">
          {model.status}
        </span>
        <span className="text-muted-foreground rounded-full border px-3 py-1 text-xs">
          {model.provider}
        </span>
      </div>
      <h3 className="mt-5 text-2xl font-semibold">{model.displayName}</h3>
      <p className="text-muted-foreground mt-3 text-sm leading-6">
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
      <p className="text-muted-foreground mt-4 max-w-3xl">{description}</p>
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
        <p className="text-muted-foreground mb-5 inline-flex rounded-full border px-4 py-2 text-sm">
          {instantRamenBrandConfig.productName} Models
        </p>
        <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-6xl">
          AI image models for a multi-model platform
        </h1>
        <p className="text-muted-foreground mt-6 max-w-3xl text-lg leading-8">
          Explore available and coming soon models inside{' '}
          {instantRamenBrandConfig.productName}. This index is data-driven: new
          model pages should come from model configuration, not copied page
          templates.
        </p>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-6 pb-24">
        <ModelGroup
          title="Available Models"
          description="Models currently available for prompt-driven image generation in Instant Ramen."
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
