import { instantRamenBrandConfig } from './brand';

import type { Brand } from '@/shared/types/blocks/common';
import type {
  Footer,
  Header,
} from '@/shared/types/blocks/landing';

export function getInstantRamenBrandBlock(): Brand {
  return {
    title: instantRamenBrandConfig.productName,
    description: instantRamenBrandConfig.description,
    logo: {
      src: instantRamenBrandConfig.logoPath,
      alt: instantRamenBrandConfig.productName,
      width: 80,
      height: 80,
    },
    url: '/',
    target: '_self',
  };
}

export function applyInstantRamenBrandToLandingLayout({
  header,
  footer,
}: {
  header: Header;
  footer: Footer;
}): {
  header: Header;
  footer: Footer;
} {
  const brand = getInstantRamenBrandBlock();

  return {
    header: {
      ...header,
      brand,
      nav: {
        items: [
          {
            title: 'AI Image Generator',
            url: '/ai-image-generator',
            icon: 'RiImage2Line',
          },
          {
            title: 'Pricing',
            url: '/pricing',
            icon: 'DollarSign',
          },
        ],
      },
      topbanner: undefined,
    },
    footer: {
      ...footer,
      brand,
      nav: {
        items: [
          {
            title: 'Product',
            children: [
              {
                title: 'AI Image Generator',
                url: '/ai-image-generator',
                target: '_self',
              },
              {
                title: 'AI Image Editor',
                url: '/ai-image-editor',
                target: '_self',
              },
              {
                title: 'Pricing',
                url: '/pricing',
                target: '_self',
              },
            ],
          },
        ],
      },
      social: undefined,
      show_built_with: false,
    },
  };
}
