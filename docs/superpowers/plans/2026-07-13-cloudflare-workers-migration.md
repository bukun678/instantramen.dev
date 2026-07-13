# Cloudflare Workers Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, preview, validate, and deploy the existing Instant Ramen full-stack Next.js application as a Cloudflare Worker without switching its production domain or removing the Vercel rollback deployment.

**Architecture:** Use `@opennextjs/cloudflare` to transform the existing Next.js server build into one Worker. Keep Supabase Auth and Supabase Transaction Pooler-backed Drizzle/Postgres unchanged, adding only the adapter configuration and the workerd package-export configuration required for `postgres`.

**Tech Stack:** Next.js 16, React 19, TypeScript, pnpm, OpenNext Cloudflare, Wrangler 4, Cloudflare Workers/workerd, Supabase Auth/PostgreSQL, Drizzle ORM, postgres.js.

---

### Task 1: Establish baseline and dependency state

**Files:**
- Verify only: `package.json`, `pnpm-lock.yaml`, `.gitignore`

- [ ] Confirm checkpoint commit exists and worktree is clean.
- [ ] Run `pnpm install --frozen-lockfile` and do not create `package-lock.json`.
- [ ] Run every `scripts/verify-instant-ramen-*.ts` script, `pnpm lint`, and `pnpm build`.
- [ ] Record any pre-existing failures before migration edits.

### Task 2: Add a migration contract verifier

**Files:**
- Create: `scripts/verify-cloudflare-workers-migration.ts`

- [ ] Write a verifier that requires `wrangler.jsonc`, `open-next.config.ts`, `.dev.vars.example`, exact Worker entry/assets/flags/date/name, required scripts, ignored secret files, absence of Edge runtime declarations, and absence of direct Supabase database hosts in committed examples.
- [ ] Run the verifier and confirm it fails before configuration exists.

### Task 3: Run official migration and normalize dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create or modify: `wrangler.jsonc`
- Create or modify: `open-next.config.ts`

- [ ] Run `pnpm dlx @opennextjs/cloudflare@latest migrate` as the pnpm equivalent of the official migration command.
- [ ] Install `@opennextjs/cloudflare@latest` and `wrangler@latest` with pnpm.
- [ ] Review all generated changes before retaining them.
- [ ] Ensure the package scripts are exactly `build`, `preview`, `deploy`, `upload`, and `cf-typegen` as specified.

### Task 4: Configure Workers runtime safely

**Files:**
- Modify: `wrangler.jsonc`
- Modify: `open-next.config.ts`
- Modify: `next.config.mjs`
- Modify: `.gitignore`
- Create: `.dev.vars.example`
- Modify: `public/_headers` only if the required static cache header is absent

- [ ] Configure Worker name, entry point, assets, compatibility date, flags, and self-reference binding.
- [ ] Keep incremental cache configuration free of R2 bindings.
- [ ] Add `postgres` to `serverExternalPackages` for workerd conditional exports.
- [ ] Initialize OpenNext's development integration in Next config if required by the generated adapter version.
- [ ] Ensure `.open-next`, `.dev.vars`, `.env*` secret files, Wrangler state, and generated type output are ignored.
- [ ] Create `.dev.vars.example` containing names and safe placeholders only; document `DATABASE_URL` as a Transaction Pooler URL.

### Task 5: Remove Vercel-only runtime coupling

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `src/extensions/analytics/index.tsx`
- Modify: `src/shared/services/analytics.ts`
- Delete: `src/extensions/analytics/vercel-analytics.tsx`
- Keep: `vercel.json` as rollback-only configuration

- [ ] Remove `@vercel/analytics` and its runtime provider wiring.
- [ ] Preserve all provider-neutral analytics and application features.
- [ ] Leave the Vercel project and rollback configuration intact.

### Task 6: Verify static migration contract and standard build

**Files:**
- Verify all changed files

- [ ] Run `pnpm tsx scripts/verify-cloudflare-workers-migration.ts` and confirm it passes.
- [ ] Run all existing Instant Ramen verification scripts.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm build`.
- [ ] If a failure occurs, apply the systematic-debugging process and make only the smallest evidence-backed fix.

### Task 7: Build and preview under workerd

**Files:**
- Modify only files proven incompatible by the OpenNext build or workerd runtime

- [ ] Run `pnpm exec opennextjs-cloudflare build`.
- [ ] Confirm the generated Worker size is within the Cloudflare account limit.
- [ ] Start `pnpm preview` and wait for the local workerd URL.
- [ ] Smoke-test homepage, static assets, auth callback behavior, unauthenticated generation API, representative API route, and locale routing.
- [ ] Verify `src/proxy.ts` from real build/runtime evidence; do not rewrite it unless it is the confirmed failing boundary.
- [ ] Where credentials permit, test Supabase session, database bridge, generation status, upload, and payment/webhook route reachability without creating unwanted production transactions.

### Task 8: Configure Worker secrets and deploy workers.dev

**Files:**
- No committed secret files

- [ ] Confirm Wrangler authentication and Cloudflare account/subdomain.
- [ ] Create or update Worker runtime secrets without printing their values.
- [ ] Validate `DATABASE_URL` hostname contains `pooler.supabase.com` before upload.
- [ ] Run `pnpm deploy` to deploy Worker `instant-ramen`.
- [ ] Do not add a route or custom domain.
- [ ] Smoke-test the workers.dev homepage and non-destructive API behavior.
- [ ] Record the workers.dev URL and the Supabase redirect URL that the user must allow.

### Task 9: Final verification and commits

**Files:**
- Review all tracked changes

- [ ] Run all Instant Ramen verifiers, the Cloudflare migration verifier, lint, standard build, and OpenNext build again.
- [ ] Confirm `git status` contains no secret file, `.open-next`, package-lock, or generated private state.
- [ ] Commit the migration with a focused commit message.
- [ ] Report exact test evidence, environment-variable migration matrix, manual Cloudflare/Supabase steps, and remaining risks.
