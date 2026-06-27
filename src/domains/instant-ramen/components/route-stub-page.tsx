import { instantRamenBrandConfig } from '../config/brand';
import { getInstantRamenPageContent } from '../content/pages';
import { InstantRamenRoute } from '../config/routes';

export function InstantRamenRouteStubPage({
  route,
}: {
  route: InstantRamenRoute;
}) {
  const content = getInstantRamenPageContent(route.key);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl flex-col justify-center px-6 py-20">
      <div className="rounded-3xl border bg-background/80 p-8 shadow-sm md:p-12">
        <p className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {instantRamenBrandConfig.productName} · {route.kind}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          {content.headline}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          {content.summary}
        </p>
        {route.reserved && (
          <p className="mt-8 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
            This route is reserved for the Instant Ramen product experience.
            Full content and functionality will be implemented in a later
            phase.
          </p>
        )}
      </div>
    </main>
  );
}
