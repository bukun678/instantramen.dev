import type { MetadataRoute } from 'next';
import { instantRamenBrandConfig } from '@/domains/instant-ramen/config/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: instantRamenBrandConfig.productName,
    short_name: instantRamenBrandConfig.productName,
    description: instantRamenBrandConfig.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F7F3EC',
    theme_color: '#F05A19',
    icons: [
      {
        src: '/icons/instant-ramen-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/instant-ramen-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/instant-ramen-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
