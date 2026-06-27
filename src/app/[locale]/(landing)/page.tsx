import { setRequestLocale } from 'next-intl/server';

import {
  InstantRamenHomeLandingPage,
  instantRamenPageContent,
} from '@/domains/instant-ramen';
import { getMetadata } from '@/shared/lib/seo';

export const revalidate = 3600;

const content = instantRamenPageContent.home;

export const generateMetadata = getMetadata({
  title: content.seo.title,
  description: content.seo.description,
  keywords: content.seo.keywords,
  canonicalUrl: content.seo.canonical,
  openGraph: content.seo.openGraph,
  noIndex: content.seo.noIndex,
});

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <InstantRamenHomeLandingPage />;
}
