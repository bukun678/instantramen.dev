export const instantRamenBrandConfig = {
  productName: 'Instant Ramen',
  domain: 'instantramen.dev',
  appUrl: 'https://instantramen.dev',
  tagline: 'AI image generation for creators',
  description:
    'Instant Ramen is a multi-model AI image generator for turning text prompts into downloadable visual concepts.',
  logoPath: '/instant-ramen-logo.svg',
  rasterLogoPath: '/logo.png',
  faviconPath: '/favicon.ico',
  socialAvatarPath: '/images/brand/instant-ramen-social-avatar.png',
  previewImagePath: '/images/og/instant-ramen-og.png',
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
    imagePath: '/images/og/instant-ramen-og.png',
    imageAlt:
      'Instant Ramen logo over an abstract orange and warm-white creative scene',
    locale: 'en_US',
  },
} as const;

export type InstantRamenBrandConfig = typeof instantRamenBrandConfig;
