import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
});

export const pages = defineDocs({
  dir: 'content/pages',
});

export const posts = defineDocs({
  dir: 'content/posts',
});

export const logs = defineDocs({
  dir: 'content/logs',
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      // Keep the Workers bundle focused on the languages used by our MDX files.
      langs: ['bash'],
      experimentalJSEngine: true,
      // Use defaultLanguage for unknown language codes
      defaultLanguage: 'plaintext',
    },
  },
});
