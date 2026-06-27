import { instantRamenBrandConfig } from '../config/brand';
import { getInstantRamenPageContent } from '../content/pages';
import { InstantRamenTextToImageMvp } from './text-to-image-mvp';

export function InstantRamenHomeLandingPage() {
  const content = getInstantRamenPageContent('home');

  return (
    <main className="bg-background text-foreground">
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div>
          <p className="mb-5 inline-flex rounded-full border px-4 py-2 text-sm text-muted-foreground">
            {instantRamenBrandConfig.productName} · Text to Image
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
            Generate images with GPT Image 2 or Nano Banana
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
    </main>
  );
}
