export type InstantRamenArtworkItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
  label: string;
  category: string;
  prompt?: string;
};

export const instantRamenArtwork = {
  hero: [
    {
      src: '/images/hero/future-night-market.webp',
      alt: 'Woman in a coral coat walking through a luminous future night market',
      width: 1672,
      height: 941,
      label: 'Example creation',
      category: 'Cinematic scene',
      prompt:
        'A cinematic editorial photograph of an adult woman in a coral coat walking through a vivid future night market, cobalt and magenta lighting, expressive crowd, atmospheric rain, no text or logos.',
    },
    {
      src: '/images/hero/ocean-cliff-pavilion.webp',
      alt: 'Colorful modern pavilion built into an ocean cliff above turquoise water',
      width: 1122,
      height: 1402,
      label: 'Creative example',
      category: 'Surreal architecture',
      prompt:
        'A surreal editorial photograph of a colorful modern pavilion carved into an ocean cliff, turquoise water below, an adult figure in a yellow coat, bright natural light, no text or logos.',
    },
    {
      src: '/images/hero/moon-garden-story.webp',
      alt: 'Child astronaut and a friendly blue bird planting flowers on the moon',
      width: 1254,
      height: 1254,
      label: 'Creative example',
      category: 'Children’s illustration',
      prompt:
        'A joyful gouache children’s-book illustration of a child astronaut and a friendly blue bird planting colorful flowers on the moon, tactile paper texture, lively colors, no text.',
    },
  ],
  gallery: [
    {
      src: '/images/gallery/cobalt-portrait.webp',
      alt: 'Editorial portrait of an adult creative director wearing a cobalt suit',
      width: 1122,
      height: 1402,
      label: 'Example creation',
      category: 'Portrait',
      prompt:
        'A polished editorial portrait of an adult Black woman creative director in a cobalt suit, coral studio backdrop, soft directional light, realistic skin texture, no text or logos.',
    },
    {
      src: '/images/gallery/modular-desk-lamp.webp',
      alt: 'Exploded view of a colorful modular desk lamp',
      width: 1254,
      height: 1254,
      label: 'Creative example',
      category: '3D product visual',
      prompt:
        'Clean three-dimensional exploded view of an unbranded modular desk lamp in coral, cobalt and mint, pale neutral studio background, no text or logos.',
    },
    {
      src: '/images/gallery/citrus-campaign.webp',
      alt: 'Colorful citrus dessert and botanical drink arranged for a summer campaign',
      width: 1672,
      height: 941,
      label: 'Creative example',
      category: 'Food photography',
      prompt:
        'Bright commercial food photograph of a sculptural citrus dessert and botanical sparkling drink, vivid yellow and pink set, fresh leaves, hard summer shadows, no text or logos.',
    },
    {
      src: '/images/gallery/alpine-travel-hero.webp',
      alt: 'Two adult hikers beside a turquoise alpine lake at sunrise',
      width: 1672,
      height: 941,
      label: 'Example creation',
      category: 'Website hero',
      prompt:
        'Wide website hero photograph of two adult hikers beside a turquoise alpine lake at sunrise, vivid outdoor clothing, expansive negative space, premium travel campaign, no text or logos.',
    },
    {
      src: '/images/gallery/coral-skate-campaign.webp',
      alt: 'Adult skateboarder in purple suspended above a coral skate bowl',
      width: 1122,
      height: 1402,
      label: 'Creative example',
      category: 'Social campaign',
      prompt:
        'Dynamic vertical social campaign image of an adult skateboarder in purple suspended above a coral skate bowl, bright blue sky, crisp graphic shadows, no text or logos.',
    },
    {
      src: '/images/gallery/cobalt-living-room.webp',
      alt: 'Modern living room with cobalt walls and coral furniture',
      width: 1672,
      height: 941,
      label: 'Example creation',
      category: 'Interior design',
      prompt:
        'Vibrant modern apartment interior with cobalt walls, coral seating, green accents and daylight, refined editorial architecture photography, no text or logos.',
    },
    {
      src: '/images/gallery/tree-library-story.webp',
      alt: 'Child and red panda librarian reading inside a magical tree library',
      width: 1122,
      height: 1402,
      label: 'Creative example',
      category: 'Children’s illustration',
      prompt:
        'Original children’s-book illustration of a child and a red panda librarian reading inside a magical tree library, lush plants, colorful books, warm storybook light, no text.',
    },
    {
      src: '/images/gallery/cobalt-headphones.webp',
      alt: 'Cobalt and coral headphones suspended in a bright water splash',
      width: 1254,
      height: 1254,
      label: 'Creative example',
      category: 'Product advertising',
      prompt:
        'Premium unbranded cobalt and coral over-ear headphones suspended in a crystalline water splash, clean commercial studio lighting, energetic mint backdrop, no text or logos.',
    },
    {
      src: '/images/gallery/future-city-courier.webp',
      alt: 'Bicycle courier riding through a luminous future coastal city',
      width: 1672,
      height: 941,
      label: 'Example creation',
      category: 'Cinematic scene',
      prompt:
        'Cinematic wide scene of an adult bicycle courier riding through a luminous future coastal city at dusk, wet streets, rich blue and coral light, no text or logos.',
    },
    {
      src: '/images/gallery/ocean-suitcase.webp',
      alt: 'Miniature ocean with sailboats emerging from an open coral suitcase',
      width: 1254,
      height: 1254,
      label: 'Creative example',
      category: 'Surreal concept',
      prompt:
        'Surreal miniature ocean and tiny sailboats emerging from an open coral suitcase on a lavender salt flat, clean daylight, imaginative commercial concept, no text.',
    },
    {
      src: '/images/gallery/corgi-flower-studio.webp',
      alt: 'Corgi in a mint raincoat surrounded by oversized paper flowers',
      width: 1003,
      height: 1568,
      label: 'Creative example',
      category: 'Pet concept',
      prompt:
        'Playful studio portrait of a corgi in a mint raincoat surrounded by oversized colorful paper flowers, bright commercial lighting, no text or logos.',
    },
    {
      src: '/images/gallery/eco-courier-character.webp',
      alt: 'Original eco-futurist bicycle courier character in colorful utility clothing',
      width: 972,
      height: 1619,
      label: 'Creative example',
      category: 'Character design',
      prompt:
        'Full-body original adult eco-futurist bicycle courier character, colorful practical utility clothing, clear silhouette, polished concept illustration, no text or logos.',
    },
  ],
  openGraph: {
    src: '/images/og/instant-ramen-og.png',
    alt: 'Instant Ramen logo over an abstract orange and warm-white creative scene',
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
  const galleryArtwork = (src: string) => {
    const artwork = instantRamenArtwork.gallery.find(
      (candidate) => candidate.src === src
    );

    if (!artwork) {
      throw new Error(`Missing Instant Ramen artwork: ${src}`);
    }

    return artwork;
  };

  if (slug === 'gpt-image-2') {
    return [
      instantRamenArtwork.hero[0],
      galleryArtwork('/images/gallery/cobalt-portrait.webp'),
      galleryArtwork('/images/gallery/future-city-courier.webp'),
    ];
  }

  if (slug === 'nano-banana') {
    return [
      instantRamenArtwork.hero[1],
      galleryArtwork('/images/gallery/citrus-campaign.webp'),
      galleryArtwork('/images/gallery/coral-skate-campaign.webp'),
    ];
  }

  return [
    {
      ...instantRamenArtwork.hero[2],
      label: 'Concept preview',
    },
    {
      ...galleryArtwork('/images/gallery/ocean-suitcase.webp'),
      label: 'Brand concept',
    },
    {
      ...galleryArtwork('/images/gallery/modular-desk-lamp.webp'),
      label: 'Creative preview',
    },
  ];
}
