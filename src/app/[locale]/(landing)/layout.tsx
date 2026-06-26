import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { getThemeLayout } from '@/core/theme';
import { applyInstantRamenBrandToLandingLayout } from '@/domains/instant-ramen';
import { LocaleDetector, TopBanner } from '@/shared/blocks/common';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

export default async function LandingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // load page data
  const t = await getTranslations('landing');

  // load layout component
  const Layout = await getThemeLayout('landing');

  // header and footer to display
  const header: HeaderType = t.raw('header');
  const footer: FooterType = t.raw('footer');
  const brandedLayout = applyInstantRamenBrandToLandingLayout({
    header,
    footer,
  });

  return (
    <Layout header={brandedLayout.header} footer={brandedLayout.footer}>
      <LocaleDetector />
      {brandedLayout.header.topbanner && brandedLayout.header.topbanner.text && (
        <TopBanner
          id="topbanner"
          text={brandedLayout.header.topbanner?.text}
          buttonText={brandedLayout.header.topbanner?.buttonText}
          href={brandedLayout.header.topbanner?.href}
          target={brandedLayout.header.topbanner?.target}
          closable
          rememberDismiss
          dismissedExpiryDays={
            brandedLayout.header.topbanner?.dismissedExpiryDays ?? 1
          }
        />
      )}
      {children}
    </Layout>
  );
}
