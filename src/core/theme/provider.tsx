'use client';

import { ReactNode, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { envConfigs } from '@/config';

// Wrangler preserves function names when it bundles the Worker. That transform
// can leave next-themes' serialized no-flash function referring to the esbuild
// `__name` helper in the browser, where the helper does not otherwise exist.
// Define the tiny helper before next-themes emits its inline script so the
// existing provider, system-theme detection, and persistence remain intact.
const cloudflareFunctionNamePrelude =
  'globalThis.__name ||= function(target, value) { try { Object.defineProperty(target, "name", { value: value, configurable: true }); } catch {} return target; };';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();

  useEffect(() => {
    if (typeof document !== 'undefined' && locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return (
    <>
      <script
        data-cfasync="false"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: cloudflareFunctionNamePrelude }}
      />
      <NextThemesProvider
        attribute="class"
        defaultTheme={envConfigs.appearance}
        enableSystem
        disableTransitionOnChange
        scriptProps={{ 'data-cfasync': 'false' }}
      >
        {children}
      </NextThemesProvider>
    </>
  );
}
