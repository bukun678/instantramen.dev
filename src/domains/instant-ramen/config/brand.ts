export const instantRamenBrandConfig = {
  productName: 'Instant Ramen',
  domain: 'instantramen.dev',
  appUrl: 'https://instantramen.dev',
  tagline: 'AI image generation for creators',
  description:
    'Instant Ramen is a multi-model AI image generator for turning text prompts into downloadable visual concepts.',
  logoPath: '/logo.png',
  faviconPath: '/favicon.ico',
  previewImagePath: '/images/og/instant-ramen-og.webp',
  seo: {
    defaultTitle: 'Instant Ramen AI Image Generator',
    defaultTitleTemplate: '%s | Instant Ramen',
    defaultDescription:
      'Create images from text prompts with Instant Ramen, a focused multi-model AI image generator for creators.',
    defaultKeywords:
      'Instant Ramen, AI image generator, text to image, GPT Image 2, Nano Banana 2',
  },
  openGraph: {
    type: 'website',
    siteName: 'Instant Ramen',
    title: 'Instant Ramen AI Image Generator',
    description:
      'Create images from text prompts with Instant Ramen, a focused multi-model AI image generator for creators.',
    url: 'https://instantramen.dev',
    imagePath: '/images/og/instant-ramen-og.webp',
    imageAlt: 'Instant Ramen AI image generator creative example',
    locale: 'en_US',
  },
} as const;

export type InstantRamenBrandConfig = typeof instantRamenBrandConfig;
