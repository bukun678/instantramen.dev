import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path: string) {
  return readFileSync(join(projectRoot, path), 'utf8');
}

function exists(path: string) {
  return existsSync(join(projectRoot, path));
}

const requiredFiles = [
  'src/domains/instant-ramen/auth/config.ts',
  'src/domains/instant-ramen/auth/client.ts',
  'src/domains/instant-ramen/auth/server.ts',
  'src/domains/instant-ramen/auth/auth-provider.tsx',
  'src/domains/instant-ramen/auth/auth-modal.tsx',
  'src/domains/instant-ramen/auth/auth-button.tsx',
  'src/app/auth/callback/route.ts',
];

for (const file of requiredFiles) {
  assert(exists(file), `Missing Instant Ramen auth file: ${file}.`);
}

const packageJson = read('package.json');
assert(packageJson.includes('@supabase/ssr'), 'Supabase SSR package is required.');
assert(
  packageJson.includes('@supabase/supabase-js'),
  'Supabase JS package is required.'
);

const envExample = read('.env.example');
assert(
  envExample.includes('NEXT_PUBLIC_SUPABASE_URL'),
  '.env.example must document NEXT_PUBLIC_SUPABASE_URL.'
);
assert(
  envExample.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  '.env.example must document NEXT_PUBLIC_SUPABASE_ANON_KEY.'
);

const config = read('src/domains/instant-ramen/auth/config.ts');
assert(
  config.includes('NEXT_PUBLIC_SUPABASE_URL') &&
    config.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  'Supabase config must read public Supabase environment variables.'
);
assert(
  config.includes('/auth/callback'),
  'Supabase config must default to /auth/callback.'
);

const client = read('src/domains/instant-ramen/auth/client.ts');
assert(
  client.includes('createBrowserClient'),
  'Instant Ramen auth client must use Supabase browser client.'
);

const server = read('src/domains/instant-ramen/auth/server.ts');
assert(
  server.includes('createServerClient') && server.includes('cookies'),
  'Instant Ramen auth server must use Supabase server client with cookies.'
);

const callback = read('src/app/auth/callback/route.ts');
assert(
  callback.includes('exchangeCodeForSession'),
  'Auth callback must exchange Supabase code for a session.'
);
assert(
  callback.includes('NextResponse.redirect'),
  'Auth callback must redirect back after login.'
);

const provider = read('src/domains/instant-ramen/auth/auth-provider.tsx');
for (const phrase of [
  'getSession',
  'onAuthStateChange',
  'signInWithOAuth',
  'signInWithOtp',
  'signOut',
  'AuthModal',
]) {
  assert(provider.includes(phrase), `AuthProvider must include ${phrase}.`);
}

const modal = read('src/domains/instant-ramen/auth/auth-modal.tsx');
for (const phrase of [
  'Sign in to Instant Ramen',
  'Instant Ramen',
  'Sign In',
  'Sign in with Google',
  'Email',
  'Send Magic Link',
]) {
  assert(modal.includes(phrase), `Auth modal must include "${phrase}".`);
}
assert(
  modal.includes('auth-modal') && modal.includes('auth-modal__google'),
  'Auth modal must preserve the legacy Instant Ramen modal class structure.'
);
assert(
  provider.includes('Check your email for the magic link.'),
  'AuthProvider must show the legacy magic-link success message.'
);

const button = read('src/domains/instant-ramen/auth/auth-button.tsx');
assert(button.includes('auth-sign-in'), 'Auth button must use legacy sign-in styling.');
assert(button.includes('Sign In'), 'Auth button must show Sign In.');

const landingLayout = read('src/themes/default/layouts/landing.tsx');
assert(
  landingLayout.includes('InstantRamenAuthProvider'),
  'Landing layout must mount Instant Ramen AuthProvider for landing pages.'
);

const header = read('src/themes/default/blocks/header.tsx');
assert(
  header.includes('InstantRamenAuthButton'),
  'Landing header must use Instant Ramen auth button.'
);

const mvp = read('src/domains/instant-ramen/components/text-to-image-mvp.tsx');
assert(
  mvp.includes('useInstantRamenAuth'),
  'Text-to-image MVP must read Instant Ramen auth state.'
);
assert(
  mvp.includes('openAuthModal'),
  'Text-to-image MVP must open the login modal for signed-out users.'
);
assert(
  mvp.includes('!session'),
  'Text-to-image MVP must gate Generate when no Supabase session exists.'
);

console.log('Instant Ramen Supabase auth migration verified.');
