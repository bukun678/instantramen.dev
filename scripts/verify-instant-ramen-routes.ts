import {
  getLocalizedInstantRamenPath,
  instantRamenRouteList,
  instantRamenRoutes,
  instantRamenSitemapRoutes,
} from '../src/domains/instant-ramen/config/routes';

const expectedPaths = [
  '/',
  '/pricing',
  '/ai-image-generator',
  '/ai-image-editor',
  '/models/instant-ramen',
  '/models/nano-banana',
  '/models/gpt-image-2',
  '/create',
  '/create/edit',
  '/create/history',
];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const configuredPaths = instantRamenRouteList.map((route) => route.path);

assert(
  expectedPaths.every((path) => configuredPaths.includes(path)),
  `Missing expected route paths. Expected ${expectedPaths.join(', ')}, got ${configuredPaths.join(', ')}`
);

assert(
  getLocalizedInstantRamenPath(instantRamenRoutes.home.path, 'en', 'en') ===
    '/',
  'English home path should not include /en'
);

assert(
  getLocalizedInstantRamenPath(
    instantRamenRoutes.pricing.path,
    'en',
    'en'
  ) === '/pricing',
  'English pricing path should not include /en'
);

assert(
  getLocalizedInstantRamenPath(
    instantRamenRoutes.pricing.path,
    'zh',
    'en'
  ) === '/zh/pricing',
  'Non-default locale path should include locale prefix'
);

assert(
  instantRamenRoutes.create.kind === 'app',
  '/create must belong to the application layer'
);

assert(
  instantRamenSitemapRoutes.every((route) => route.sitemap),
  'Only sitemap-enabled routes should be exported for sitemap generation'
);

console.log('Instant Ramen route mapping verified.');
