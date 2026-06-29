import { instantRamenBrandConfig } from '../config/brand';
import type { InstantRamenModelComparisonConfig } from './types';

function comparisonSeo({
  slug,
  title,
  description,
  keywords,
}: {
  slug: string;
  title: string;
  description: string;
  keywords: string;
}) {
  return {
    title,
    description,
    canonical: `/compare/${slug}`,
    keywords,
    openGraph: {
      title,
      description,
      imagePath: instantRamenBrandConfig.previewImagePath,
      imageAlt: instantRamenBrandConfig.openGraph.imageAlt,
      type: 'website' as const,
    },
    noIndex: false,
  };
}

export const instantRamenModelComparisons: InstantRamenModelComparisonConfig[] = [
  {
    slug: 'nano-banana-vs-gpt-image-2',
    leftModel: 'nano-banana',
    rightModel: 'gpt-image-2',
    status: 'planned',
    seo: comparisonSeo({
      slug: 'nano-banana-vs-gpt-image-2',
      title: 'Nano Banana 2 vs GPT Image 2',
      description:
        'Compare Nano Banana 2 and GPT Image 2 for AI image generation inside Instant Ramen, a multi-model AI image generation platform.',
      keywords:
        'Nano Banana 2 vs GPT Image 2, AI image model comparison, image generation models',
    }),
  },
  {
    slug: 'flux-vs-imagen',
    leftModel: 'flux',
    rightModel: 'imagen',
    status: 'planned',
    seo: comparisonSeo({
      slug: 'flux-vs-imagen',
      title: 'FLUX vs Imagen',
      description:
        'Compare FLUX and Imagen for text-to-image workflows inside Instant Ramen.',
      keywords: 'FLUX vs Imagen, AI image generator comparison',
    }),
  },
];
