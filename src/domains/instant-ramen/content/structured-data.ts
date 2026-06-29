import { instantRamenBrandConfig } from '../config/brand';

export type InstantRamenFaqItem = {
  question: string;
  answer: string;
};

export function buildInstantRamenOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: instantRamenBrandConfig.productName,
    url: instantRamenBrandConfig.appUrl,
  } as const;
}

export function buildInstantRamenWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: instantRamenBrandConfig.productName,
    url: instantRamenBrandConfig.appUrl,
    inLanguage: 'en',
  } as const;
}

export function buildInstantRamenSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: instantRamenBrandConfig.productName,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    url: instantRamenBrandConfig.appUrl,
    description: instantRamenBrandConfig.description,
  } as const;
}

export function buildInstantRamenWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: instantRamenBrandConfig.productName,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    url: instantRamenBrandConfig.appUrl,
    description: instantRamenBrandConfig.description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  } as const;
}

export function buildInstantRamenBreadcrumbSchema(
  items: ReadonlyArray<{ name: string; path: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, instantRamenBrandConfig.appUrl).toString(),
    })),
  } as const;
}

export function buildInstantRamenFaqSchema(
  items: ReadonlyArray<InstantRamenFaqItem>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } as const;
}
