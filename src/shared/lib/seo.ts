import type { Metadata } from 'next';
import { instantRamenBrandConfig } from '@/domains/instant-ramen';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import { defaultLocale } from '@/config/locale';

export type InstantRamenMetadataOptions = {
  title?: string;
  description?: string;
  keywords?: string;
  metadataKey?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  openGraph?: {
    title?: string;
    description?: string;
    imagePath?: string;
    imageAlt?: string;
  };
  appName?: string;
  noIndex?: boolean;
};

export async function buildInstantRamenMetadata(
  options: InstantRamenMetadataOptions = {},
  locale = defaultLocale
): Promise<Metadata> {
  setRequestLocale(locale);

  const passedMetadata = {
    title: options.title,
    description: options.description,
    keywords: options.keywords,
  };
  const defaultMetadata = getBrandDefaultMetadata();

  let translatedMetadata: any = {};
  if (options.metadataKey) {
    translatedMetadata = await getTranslatedMetadata(
      options.metadataKey,
      locale
    );
  }

  const canonicalUrl = await getCanonicalUrl(
    options.canonicalUrl || '',
    locale || ''
  );
  const rawTitle =
    passedMetadata.title || translatedMetadata.title || defaultMetadata.title;
  const description =
    passedMetadata.description ||
    translatedMetadata.description ||
    defaultMetadata.description;
  const title = formatSeoTitle(rawTitle);

  let imageUrl =
    options.imageUrl || options.openGraph?.imagePath || envConfigs.og_image;
  if (!imageUrl.startsWith('http')) {
    imageUrl = `${envConfigs.app_url}${imageUrl}`;
  }

  const appName = options.appName || envConfigs.app_name || '';

  return {
    title,
    description,
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico' },
        {
          url: '/favicon-16x16.png',
          sizes: '16x16',
          type: 'image/png',
        },
        {
          url: '/favicon-32x32.png',
          sizes: '32x32',
          type: 'image/png',
        },
      ],
      apple: [
        {
          url: '/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
      shortcut: [{ url: '/favicon.ico' }],
    },
    keywords:
      passedMetadata.keywords ||
      translatedMetadata.keywords ||
      defaultMetadata.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      locale: instantRamenBrandConfig.openGraph.locale || locale,
      url: canonicalUrl,
      title: options.openGraph?.title || title,
      description: options.openGraph?.description || description,
      siteName: appName,
      images: [
        {
          url: imageUrl.toString(),
          alt: options.openGraph?.imageAlt || envConfigs.og_image_alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: imageUrl.toString(),
          alt: options.openGraph?.imageAlt || envConfigs.og_image_alt,
        },
      ],
      site: envConfigs.app_url,
    },
    robots: {
      index: !options.noIndex,
      follow: !options.noIndex,
    },
  };
}

// get metadata for page component
export function getMetadata(options: InstantRamenMetadataOptions = {}) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = await params;
    return buildInstantRamenMetadata(options, locale);
  };
}

function getBrandDefaultMetadata() {
  return {
    title: instantRamenBrandConfig.seo.defaultTitle,
    description: envConfigs.seo_description,
    keywords: instantRamenBrandConfig.seo.defaultKeywords,
  };
}

function formatSeoTitle(title: string) {
  if (!title) {
    return instantRamenBrandConfig.seo.defaultTitle;
  }

  if (title.includes(instantRamenBrandConfig.productName)) {
    return title;
  }

  return envConfigs.seo_title_template.replace('%s', title);
}

async function getTranslatedMetadata(metadataKey: string, locale: string) {
  setRequestLocale(locale);
  const t = await getTranslations(metadataKey);

  return {
    title: t.has('title') ? t('title') : '',
    description: t.has('description') ? t('description') : '',
    keywords: t.has('keywords') ? t('keywords') : '',
  };
}

async function getCanonicalUrl(canonicalUrl: string, locale: string) {
  if (!canonicalUrl) {
    canonicalUrl = '/';
  }

  if (canonicalUrl.startsWith('http')) {
    // full url
    canonicalUrl = canonicalUrl;
  } else {
    // relative path
    if (!canonicalUrl.startsWith('/')) {
      canonicalUrl = `/${canonicalUrl}`;
    }

    canonicalUrl = `${envConfigs.app_url}${
      !locale || locale === defaultLocale ? '' : `/${locale}`
    }${canonicalUrl}`;

    if (locale !== defaultLocale && canonicalUrl.endsWith('/')) {
      canonicalUrl = canonicalUrl.slice(0, -1);
    }
  }

  return canonicalUrl;
}
