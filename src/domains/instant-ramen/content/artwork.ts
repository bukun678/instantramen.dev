export type InstantRamenArtworkItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
  label: string;
  category: string;
};

export const instantRamenArtwork = {
  hero: [
    {
      src: '/images/hero/amber-glass-vessel.webp',
      alt: 'Amber glass vessel photographed on a dark sculptural pedestal',
      width: 1672,
      height: 941,
      label: 'Example creation',
      category: 'Product photography',
    },
    {
      src: '/images/hero/desert-observatory.webp',
      alt: 'Circular observatory in a desert landscape beneath an orange moon',
      width: 1672,
      height: 941,
      label: 'Creative example',
      category: 'Cinematic scene',
    },
    {
      src: '/images/hero/paper-landscape.webp',
      alt: 'Ivory paper landscape with a black sphere and orange ribbon',
      width: 1672,
      height: 941,
      label: 'Creative example',
      category: 'Editorial concept',
    },
  ],
  gallery: [
    {
      src: '/images/gallery/ceramic-artist.webp',
      alt: 'Portrait of a ceramic artist in a warm studio',
      width: 1122,
      height: 1402,
      label: 'Example creation',
      category: 'Portrait',
    },
    {
      src: '/images/gallery/sculptural-speaker.webp',
      alt: 'Matte black sculptural speaker with an orange carrying strap',
      width: 1254,
      height: 1254,
      label: 'Example creation',
      category: 'Product',
    },
    {
      src: '/images/gallery/coastal-railway.webp',
      alt: 'Cinematic coastal railway platform at blue hour',
      width: 1672,
      height: 941,
      label: 'Example creation',
      category: 'Cinema',
    },
    {
      src: '/images/gallery/orange-paper-boat.webp',
      alt: 'Gouache illustration of an orange paper boat in a lotus pond',
      width: 1122,
      height: 1402,
      label: 'Example creation',
      category: 'Illustration',
    },
    {
      src: '/images/gallery/stone-orb-study.webp',
      alt: 'Three-dimensional stone balance sculpture with an amber glass orb',
      width: 1254,
      height: 1254,
      label: 'Creative example',
      category: '3D',
    },
    {
      src: '/images/gallery/limestone-reading-room.webp',
      alt: 'Sunlit limestone reading room with an orange lounge chair',
      width: 1672,
      height: 941,
      label: 'Example creation',
      category: 'Interior',
    },
    {
      src: '/images/gallery/fox-rain-cape.webp',
      alt: 'Fox wearing a cream rain cape beneath dramatic orange clouds',
      width: 1122,
      height: 1402,
      label: 'Creative example',
      category: 'Animal concept',
    },
    {
      src: '/images/gallery/ocean-stone-cube.webp',
      alt: 'Miniature ocean and orange sailboat contained inside a black stone cube',
      width: 1254,
      height: 1254,
      label: 'Creative example',
      category: 'Surreal concept',
    },
  ],
  openGraph: {
    src: '/images/og/instant-ramen-og.webp',
    alt: 'Instant Ramen AI image generator creative example',
    width: 1200,
    height: 630,
    label: 'Instant Ramen',
    category: 'Open Graph',
  },
} as const satisfies {
  hero: readonly InstantRamenArtworkItem[];
  gallery: readonly InstantRamenArtworkItem[];
  openGraph: InstantRamenArtworkItem;
};

export function getInstantRamenModelArtwork(slug: string) {
  if (slug === 'gpt-image-2') {
    return [
      instantRamenArtwork.hero[0],
      instantRamenArtwork.gallery[0],
      instantRamenArtwork.gallery[5],
    ];
  }

  if (slug === 'nano-banana') {
    return [
      instantRamenArtwork.hero[1],
      instantRamenArtwork.gallery[3],
      instantRamenArtwork.gallery[6],
    ];
  }

  return [
    {
      ...instantRamenArtwork.hero[2],
      label: 'Concept preview',
    },
    {
      ...instantRamenArtwork.gallery[4],
      label: 'Brand concept',
    },
    {
      ...instantRamenArtwork.gallery[7],
      label: 'Creative preview',
    },
  ];
}
