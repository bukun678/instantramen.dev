import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { instantRamenPageContent } from '@/domains/instant-ramen';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';

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

  const t = await getTranslations('pages.index');

  // get page data
  const page: DynamicPage = t.raw('page');

  // load page component
  const Page = await getThemePage('dynamic-page');

  return <Page locale={locale} page={page} />;
}
