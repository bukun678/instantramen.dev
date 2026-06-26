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
      topbanner: undefined,
    },
    footer: {
      ...footer,
      brand,
      show_built_with: false,
    },
  };
}
