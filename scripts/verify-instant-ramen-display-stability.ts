import { readFileSync } from 'node:fs';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const homepage = readFileSync(
  'src/domains/instant-ramen/components/home-landing-page.tsx',
  'utf8'
);
const header = readFileSync('src/themes/default/blocks/header.tsx', 'utf8');
const layout = readFileSync(
  'src/domains/instant-ramen/config/layout.ts',
  'utf8'
);
const styles = readFileSync('src/config/style/global.css', 'utf8');

assert(
  header.includes('h-14') && header.includes('lg:h-18'),
  'The fixed Header shell must have a real mobile and desktop height so viewport capture and layout metrics stay stable.'
);
assert(
  homepage.includes('id="models"') &&
    homepage.includes('className="scroll-mt-20 border-t'),
  'The models anchor must reserve the sticky Header height.'
);
assert(
  homepage.includes('instant-ramen-gallery') &&
    homepage.includes('instant-ramen-final-cta'),
  'Gallery and the final CTA need explicit section classes for distinct dark-mode hierarchy.'
);
assert(
  styles.includes('.dark .instant-ramen-gallery') &&
    styles.includes('.dark .instant-ramen-final-cta') &&
    styles.includes('.dark .instant-ramen-footer'),
  'Dark mode must keep Gallery, final CTA, and Footer at distinct visual levels.'
);
assert(
  !layout.includes("title: 'AI Image Editor'"),
  'The unfinished AI Image Editor must not remain in the production Footer navigation.'
);
assert(
  homepage.includes('data-mobile-gallery="rail"') &&
    homepage.includes('data-gallery-prompt') &&
    !homepage.includes('opacity-0 transition duration-700'),
  'Gallery artwork must remain visible without depending on an entrance animation or Intersection Observer.'
);

console.log('Instant Ramen display stability verification passed.');
