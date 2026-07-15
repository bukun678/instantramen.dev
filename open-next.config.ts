import {
  defineCloudflareConfig,
  type OpenNextConfig,
} from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig({}),
  // Next.js 16 defaults to Turbopack, whose server output nearly doubles the
  // bundled Worker for this app. Webpack keeps the same runtime behavior while
  // staying below Cloudflare's 3 MiB free-plan compressed script limit.
  buildCommand: "pnpm next build --webpack",
} satisfies OpenNextConfig;
