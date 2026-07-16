import { notFound } from 'next/navigation';
import {
  getInstantRamenModelBySlug,
  InstantRamenModelPageTemplate,
} from '@/domains/instant-ramen';
import { setRequestLocale } from 'next-intl/server';

import { buildInstantRamenMetadata } from '@/shared/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const model = getInstantRamenModelBySlug(slug);

  if (!model) {
    return {};
  }

  return await buildInstantRamenMetadata(
    {
      title: model.seo.title,
      description: model.seo.description,
      keywords: model.seo.keywords,
      canonicalUrl: model.seo.canonical,
      openGraph: model.seo.openGraph,
      noIndex: model.seo.noIndex,
    },
    locale
  );
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const model = getInstantRamenModelBySlug(slug);

  if (!model) {
    notFound();
  }

  return <InstantRamenModelPageTemplate model={model} />;
}
