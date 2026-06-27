import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';
import {
  getLocalizedInstantRamenPath,
  instantRamenSitemapRoutes,
} from '@/domains/instant-ramen';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = envConfigs.app_url.replace(/\/$/, '');
  const lastModified = new Date();

  return instantRamenSitemapRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${appUrl}${getLocalizedInstantRamenPath(
        route.path,
        locale,
        defaultLocale
      )}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  );
}
