export const instantRamenBrandConfig = {
  productName: 'Instant Ramen',
  domain: 'instantramen.dev',
  appUrl: 'https://instantramen.dev',
  tagline: 'AI image generation and editing for creators',
  description:
    'Instant Ramen is a multi-model AI image generation platform for creating, editing, and iterating visuals with leading image models.',
  logoPath: '/logo.png',
  faviconPath: '/favicon.ico',
  previewImagePath: '/preview.png',
  seo: {
    defaultTitle: 'Instant Ramen AI Image Generator',
    defaultTitleTemplate: '%s | Instant Ramen',
    defaultDescription:
      'Create and edit images with Instant Ramen, a multi-model AI image generation platform for creators.',
    defaultKeywords:
      'Instant Ramen, AI image generator, AI image editor, image generation, image editing',
  },
  openGraph: {
    type: 'website',
    siteName: 'Instant Ramen',
    title: 'Instant Ramen AI Image Generator',
    description:
      'Create and edit images with Instant Ramen, a multi-model AI image generation platform for creators.',
    url: 'https://instantramen.dev',
    imagePath: '/preview.png',
    imageAlt: 'Instant Ramen AI image generation platform',
    locale: 'en_US',
  },
} as const;

export type InstantRamenBrandConfig = typeof instantRamenBrandConfig;
