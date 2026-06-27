import { setRequestLocale } from 'next-intl/server';

import {
  InstantRamenRouteStubPage,
  instantRamenRoutes,
} from '@/domains/instant-ramen';
import { getMetadata } from '@/shared/lib/seo';

export const revalidate = 3600;

const route = instantRamenRoutes.modelInstantRamen;

export const generateMetadata = getMetadata({
  title: route.title,
  description: route.description,
  canonicalUrl: route.path,
});

export default async function InstantRamenModelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <InstantRamenRouteStubPage route={route} />;
}
