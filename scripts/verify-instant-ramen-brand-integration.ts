import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path: string) {
  return readFileSync(path, 'utf8');
}

function sha256(path: string) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function readPngDimensions(path: string) {
  assert(existsSync(path), `Missing PNG asset: ${path}`);
  const image = readFileSync(path);
  assert(
    image.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
    `${path} must be a real PNG file.`
  );

  return {
    width: image.readUInt32BE(16),
    height: image.readUInt32BE(20),
  };
}

function assertPngDimensions(path: string, width: number, height: number) {
  const dimensions = readPngDimensions(path);
  assert(
    dimensions.width === width && dimensions.height === height,
    `${path} must be ${width}x${height}, received ${dimensions.width}x${dimensions.height}.`
  );
}

const officialLogoPath = 'public/instant-ramen-logo.svg';
const officialLogoHash =
  '8366bdf26c5e57a96830d548a4d9993627f4b8738fa4785bea191c62f338e3f0';
const oldShipAnyLogoHash =
  '3eeb7cfe6e56c24bfc2b9e14ee269982018700c7f7607b85a306c9b5b4f85ee0';

assert(existsSync(officialLogoPath), 'The frozen official SVG must exist.');
assert(
  sha256(officialLogoPath) === officialLogoHash,
  'The frozen official SVG geometry, colors, connection, radius, and viewBox must not change.'
);

const officialLogo = read(officialLogoPath);
assert(
  officialLogo.includes('fill="#F05A19"') &&
    officialLogo.includes('fill="currentColor"') &&
    officialLogo.includes('id="instant-ramen-mark"'),
  'The official SVG must preserve the orange I, currentColor R, and shared mark id.'
);

for (const [path, width, height] of [
  ['public/favicon-16x16.png', 16, 16],
  ['public/favicon-32x32.png', 32, 32],
  ['public/apple-touch-icon.png', 180, 180],
  ['public/icons/instant-ramen-192.png', 192, 192],
  ['public/icons/instant-ramen-512.png', 512, 512],
  ['public/logo.png', 1024, 1024],
  ['public/images/brand/instant-ramen-social-avatar.png', 1024, 1024],
  ['public/images/og/instant-ramen-og.png', 1200, 630],
] as const) {
  assertPngDimensions(path, width, height);
}

assert(
  sha256('public/logo.png') !== oldShipAnyLogoHash,
  'The compatibility PNG must no longer contain the old ShipAny sailboat.'
);

assert(existsSync('public/favicon.ico'), 'The favicon ICO must exist.');
const favicon = readFileSync('public/favicon.ico');
assert(
  favicon.readUInt16LE(0) === 0 && favicon.readUInt16LE(2) === 1,
  'public/favicon.ico must be a real ICO container.'
);
const faviconSizes = new Set<number>();
const faviconCount = favicon.readUInt16LE(4);
for (let index = 0; index < faviconCount; index += 1) {
  const entryOffset = 6 + index * 16;
  const sizeByte = favicon.readUInt8(entryOffset);
  faviconSizes.add(sizeByte === 0 ? 256 : sizeByte);
}
for (const requiredSize of [16, 32, 48]) {
  assert(
    faviconSizes.has(requiredSize),
    `public/favicon.ico must include a ${requiredSize}px image.`
  );
}

const brandConfig = read('src/domains/instant-ramen/config/brand.ts');
assert(
  brandConfig.includes("logoPath: '/instant-ramen-logo.svg'") &&
    brandConfig.includes("rasterLogoPath: '/logo.png'") &&
    brandConfig.includes(
      "socialAvatarPath: '/images/brand/instant-ramen-social-avatar.png'"
    ) &&
    brandConfig.includes("previewImagePath: '/images/og/instant-ramen-og.png'"),
  'Brand config must expose the official SVG, PNG fallback, social avatar, and branded OG image.'
);

const header = read('src/themes/default/blocks/header.tsx');
assert(
  header.includes('className="text-foreground size-6 shrink-0"') &&
    header.includes('/instant-ramen-logo.svg#instant-ramen-mark'),
  'The approved 24px Header integration must remain intact.'
);

const brandLogo = read('src/shared/blocks/common/brand-logo.tsx');
assert(
  brandLogo.includes('InstantRamenLogoMark') &&
    brandLogo.includes('instant-ramen-logo.svg'),
  'Shared BrandLogo must render the official currentColor mark for Footer and auth surfaces.'
);

const sidebarHeader = read('src/shared/blocks/dashboard/sidebar-header.tsx');
assert(
  /label=\{\s*header\.brand\.title \? undefined : header\.brand\.logo\.alt\s*\}/.test(
    sidebarHeader
  ),
  'Dashboard logo must be decorative when the adjacent brand title already names the link.'
);

const manifest = read('src/app/manifest.ts');
for (const expectedManifestValue of [
  "'/icons/instant-ramen-192.png'",
  "'/icons/instant-ramen-512.png'",
  "purpose: 'any'",
  "purpose: 'maskable'",
]) {
  assert(
    manifest.includes(expectedManifestValue),
    `Manifest must include ${expectedManifestValue}.`
  );
}

const metadataBuilder = read('src/shared/lib/seo.ts');
for (const expectedMetadataValue of [
  "manifest: '/manifest.webmanifest'",
  "url: '/favicon-16x16.png'",
  "url: '/favicon-32x32.png'",
  "url: '/apple-touch-icon.png'",
]) {
  assert(
    metadataBuilder.includes(expectedMetadataValue),
    `Metadata must include ${expectedMetadataValue}.`
  );
}

const localeLayout = read('src/app/[locale]/layout.tsx');
assert(
  !localeLayout.includes('<link rel="alternate icon"') &&
    !localeLayout.includes('<link rel="icon"'),
  'Locale layout must rely on Metadata Icons instead of duplicate manual favicon links.'
);

console.log('Instant Ramen brand integration contract verified.');
