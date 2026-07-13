import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import {
  getInstantRamenModelBySlug,
  InstantRamenModelPageTemplate,
} from '@/domains/instant-ramen';
import { getMetadata } from '@/shared/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = getInstantRamenModelBySlug(slug);

  if (!model) {
    return {};
  }

  return getMetadata({
    title: model.seo.title,
    description: model.seo.description,
    keywords: model.seo.keywords,
    canonicalUrl: model.seo.canonical,
    openGraph: model.seo.openGraph,
    noIndex: model.seo.noIndex,
  });
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
