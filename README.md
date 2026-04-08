# QuickConvert

QuickConvert is a full-stack file conversion app scaffold built with:

- Next.js App Router + Tailwind CSS
- Express + TypeScript APIs
- Prisma ORM + Neon Postgres
- JWT auth + Stripe subscriptions
- Background job queue for conversion processing
- Sentry monitoring hooks

## Apps

- `apps/web`: marketing site, tool pages, dashboard, login, pricing
- `apps/api`: Express API, Prisma schema, conversion queue, Stripe hooks
- `packages/shared`: shared tool metadata, limits, helpers

## Quick Start

1. Copy `.env.example` to `.env`
2. Install dependencies with `pnpm install`
3. Generate Prisma client: `pnpm db:generate`
4. Push schema to Neon: `pnpm db:push`
5. Seed starter data: `pnpm db:seed`
6. Run both apps: `pnpm dev`

The Prisma scripts are configured to read the workspace root `.env`, so you do not need a separate `apps/api/.env`.

If `pnpm` is not installed yet, enable it with Corepack:

```bash
corepack enable
corepack prepare pnpm@10.8.1 --activate
```

## Deployment

- Deploy `apps/web` to Vercel
- Deploy `apps/api` to a Node runtime such as Railway, Render, Fly.io, or a serverless Express wrapper
- Point both apps at the same Neon Postgres database
- Configure Stripe webhook to `POST /api/billing/webhook`
- Set Sentry DSNs for both frontend and backend
- Put the web app behind Vercel Edge or a CDN, and the API behind HTTPS with platform-level DDoS protection
- Use the temporary uploads directory on ephemeral storage or object storage with lifecycle deletion if you want CDN-backed downloads
- Enable Neon backups, SSL, and least-privilege environment variables in production

## Notes

- PDF/Word conversions are implemented with a provider abstraction. The included worker supports text-preserving conversion scaffolding and image/PDF workflows out of the box.
- Temporary uploads are auto-deleted after the configured TTL.
- Free and premium limits are enforced server-side.
