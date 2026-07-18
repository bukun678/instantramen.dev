import Image from 'next/image';

import { Link } from '@/core/i18n/navigation';
import { Brand as BrandType } from '@/shared/types/blocks/common';

import { InstantRamenLogoMark } from './instant-ramen-logo-mark';

export function BrandLogo({ brand }: { brand: BrandType }) {
  const usesInstantRamenMark =
    brand.logo?.src.split('#')[0] === '/instant-ramen-logo.svg';

  return (
    <Link
      href={brand.url || ''}
      target={brand.target || '_self'}
      className={`flex items-center space-x-3 ${brand.className || ''}`}
    >
      {brand.logo && usesInstantRamenMark ? (
        <InstantRamenLogoMark
          className={`text-foreground ${brand.logo.className || 'size-8'}`}
          label={brand.title ? undefined : brand.logo.alt}
        />
      ) : brand.logo ? (
        <Image
          src={brand.logo.src}
          alt={brand.title ? '' : brand.logo.alt || ''}
          width={brand.logo.width || 80}
          height={brand.logo.height || 80}
          className={brand.logo.className || 'h-8 w-auto rounded-lg'}
          unoptimized={brand.logo.src.startsWith('http')}
        />
      ) : null}
      {brand.title && (
        <span className="text-lg font-medium">{brand.title}</span>
      )}
    </Link>
  );
}
