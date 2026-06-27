import { instantRamenModels } from '../content/models';

export type InstantRamenRouteKind =
  | 'landing'
  | 'seo-tool'
  | 'model-seo'
  | 'app';

export type InstantRamenRouteKey =
  | 'home'
  | 'pricing'
  | 'aiImageGenerator'
  | 'aiImageEditor'
  | 'models'
  | 'create'
  | 'createEdit'
  | 'createHistory';

export interface InstantRamenSitemapRoute {
  key: string;
  path: string;
  kind: InstantRamenRouteKind;
  title: string;
  description: string;
  sitemap: boolean;
  priority: number;
  changeFrequency:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  reserved?: boolean;
}

export interface InstantRamenRoute extends InstantRamenSitemapRoute {
  key: InstantRamenRouteKey;
}

export const instantRamenRoutes: Record<
  InstantRamenRouteKey,
  InstantRamenRoute
> = {
  home: {
    key: 'home',
    path: '/',
    kind: 'landing',
    title: 'Instant Ramen AI Image Generator',
    description:
      'Create and edit images with Instant Ramen, a multi-model AI image generation platform for creators.',
    sitemap: true,
    priority: 1,
    changeFrequency: 'weekly',
  },
  pricing: {
    key: 'pricing',
    path: '/pricing',
    kind: 'landing',
    title: 'Pricing',
    description:
      'Choose the Instant Ramen plan that fits your AI image generation workflow.',
    sitemap: true,
    priority: 0.8,
    changeFrequency: 'weekly',
  },
  aiImageGenerator: {
    key: 'aiImageGenerator',
    path: '/ai-image-generator',
    kind: 'seo-tool',
    title: 'AI Image Generator',
    description:
      'Generate images from text prompts with Instant Ramen and leading AI image models.',
    sitemap: true,
    priority: 0.9,
    changeFrequency: 'weekly',
  },
  aiImageEditor: {
    key: 'aiImageEditor',
    path: '/ai-image-editor',
    kind: 'seo-tool',
    title: 'AI Image Editor',
    description:
      'Edit, refine, and transform images with Instant Ramen AI image editing tools.',
    sitemap: true,
    priority: 0.85,
    changeFrequency: 'weekly',
    reserved: true,
  },
  models: {
    key: 'models',
    path: '/models',
    kind: 'model-seo',
    title: 'AI Image Models',
    description:
      'Explore AI image models available inside Instant Ramen, a multi-model AI image generation platform.',
    sitemap: true,
    priority: 0.85,
    changeFrequency: 'weekly',
  },
  create: {
    key: 'create',
    path: '/create',
    kind: 'app',
    title: 'Create',
    description:
      'Open the Instant Ramen image generation workspace. Full generation tools will be connected in a later phase.',
    sitemap: false,
    priority: 0.4,
    changeFrequency: 'weekly',
    reserved: true,
  },
  createEdit: {
    key: 'createEdit',
    path: '/create/edit',
    kind: 'app',
    title: 'Edit Images',
    description:
      'Open the Instant Ramen image editing workspace. Editing tools will be connected in a later phase.',
    sitemap: false,
    priority: 0.4,
    changeFrequency: 'weekly',
    reserved: true,
  },
  createHistory: {
    key: 'createHistory',
    path: '/create/history',
    kind: 'app',
    title: 'Generation History',
    description:
      'Review Instant Ramen generation history. History storage will be connected in a later phase.',
    sitemap: false,
    priority: 0.3,
    changeFrequency: 'weekly',
    reserved: true,
  },
};

export const instantRamenModelRoutes: InstantRamenSitemapRoute[] =
  instantRamenModels.map((model) => ({
    key: `model:${model.slug}`,
    path: `/models/${model.slug}`,
    kind: 'model-seo',
    title: model.seo.title,
    description: model.seo.description,
    sitemap: true,
    priority: model.status === 'coming-soon' ? 0.75 : 0.8,
    changeFrequency: 'weekly',
  }));

export const instantRamenRouteList: InstantRamenSitemapRoute[] = [
  ...Object.values(instantRamenRoutes),
  ...instantRamenModelRoutes,
];

export const instantRamenSitemapRoutes = instantRamenRouteList.filter(
  (route) => route.sitemap
);

export function getLocalizedInstantRamenPath(
  path: string,
  locale: string,
  defaultLocale: string
) {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  if (!locale || locale === defaultLocale) {
    return path;
  }

  if (path === '/') {
    return `/${locale}`;
  }

  return `/${locale}${path}`;
}
