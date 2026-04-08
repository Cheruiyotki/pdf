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
2. Install dependencies with `npm install`
3. Generate Prisma client: `npm run db:generate`
4. Push schema to Neon: `npm run db:push`
5. Seed starter data: `npm run db:seed`
6. Run both apps: `npm run dev`

## Deployment

- Deploy `apps/web` to Vercel
- Deploy `apps/api` to a Node runtime such as Railway, Render, Fly.io, or a serverless Express wrapper
- Point both apps at the same Neon Postgres database
- Configure Stripe webhook to `POST /api/billing/webhook`
- Set Sentry DSNs for both frontend and backend

## Notes

- PDF/Word conversions are implemented with a provider abstraction. The included worker supports text-preserving conversion scaffolding and image/PDF workflows out of the box.
- Temporary uploads are auto-deleted after the configured TTL.
- Free and premium limits are enforced server-side.
