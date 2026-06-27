import { setRequestLocale } from 'next-intl/server';

import {
  instantRamenPageContent,
  InstantRamenRouteStubPage,
  instantRamenRoutes,
} from '@/domains/instant-ramen';
import { getMetadata } from '@/shared/lib/seo';

const route = instantRamenRoutes.create;
const content = instantRamenPageContent.create;

export const generateMetadata = getMetadata({
  title: content.seo.title,
  description: content.seo.description,
  keywords: content.seo.keywords,
  canonicalUrl: content.seo.canonical,
  openGraph: content.seo.openGraph,
  noIndex: content.seo.noIndex,
});

export default async function CreatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <InstantRamenRouteStubPage route={route} />;
}
