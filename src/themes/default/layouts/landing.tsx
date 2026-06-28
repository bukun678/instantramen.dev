import { ReactNode } from 'react';

import { getThemeBlock } from '@/core/theme';
import { InstantRamenAuthProvider } from '@/domains/instant-ramen/auth';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

export default async function LandingLayout({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: HeaderType;
  footer: FooterType;
}) {
  const Header = await getThemeBlock('header');
  const Footer = await getThemeBlock('footer');

  return (
    <div className="h-screen w-screen">
      <InstantRamenAuthProvider>
        <Header header={header} />
        {children}
        <Footer footer={footer} />
      </InstantRamenAuthProvider>
    </div>
  );
}
