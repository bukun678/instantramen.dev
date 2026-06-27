import { setRequestLocale } from 'next-intl/server';

import {
  InstantRamenRouteStubPage,
  instantRamenRoutes,
} from '@/domains/instant-ramen';
import { getMetadata } from '@/shared/lib/seo';

const route = instantRamenRoutes.create;

export const generateMetadata = getMetadata({
  title: route.title,
  description: route.description,
  canonicalUrl: route.path,
  noIndex: true,
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
