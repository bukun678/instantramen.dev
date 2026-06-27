import { setRequestLocale } from 'next-intl/server';

import {
  instantRamenPageContent,
  InstantRamenRouteStubPage,
  instantRamenRoutes,
} from '@/domains/instant-ramen';
import { getMetadata } from '@/shared/lib/seo';

export const revalidate = 3600;

const route = instantRamenRoutes.modelNanoBanana;
const content = instantRamenPageContent.modelNanoBanana;

export const generateMetadata = getMetadata({
  title: content.seo.title,
  description: content.seo.description,
  keywords: content.seo.keywords,
  canonicalUrl: content.seo.canonical,
  openGraph: content.seo.openGraph,
  noIndex: content.seo.noIndex,
});

export default async function NanoBananaModelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <InstantRamenRouteStubPage route={route} />;
}
