# Paintshop

Online gallery and store for an independent painter: a public catalogue of paintings and series, painting detail pages with purchase inquiries, and a protected admin panel for managing the collection. Sells within Ukraine and ships to Europe and the USA.

## Features
- Gallery with filters, painting detail pages, lightbox image viewer and share buttons
- Purchase inquiry form with validation; new inquiries are sent to the owner via a Telegram bot
- Admin panel (Supabase Auth): create and edit paintings and series, manage images, track inquiry status
- SEO: generated `sitemap.xml` and `robots.txt`, slug-based URLs
- Page transitions and motion with `motion`

## Tech stack
Next.js (App Router), React, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), Telegram Bot API.

## Project structure
```
app/(site)/          public pages: home, gallery, painting, about, contact, shipping
app/admin/           login + protected admin pages (guarded by middleware.ts)
components/          UI grouped by feature (gallery, painting-detail, admin, layout, motion)
lib/actions/         server actions: paintings, series, inquiries, auth
lib/supabase/        browser / server / middleware Supabase clients and queries
lib/notifications/   Telegram notifications
```

## Getting started
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values
3. Run the dev server: `npm run dev`, then open http://localhost:3000

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public (anon) key |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for the sitemap and share links |
| `TELEGRAM_BOT_TOKEN` | Bot that sends inquiry notifications |
| `TELEGRAM_ADMIN_CHAT_ID` | Chat that receives them |

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Development
Built together with an AI coding agent; project rules for agents are in `CLAUDE.md` and `AGENTS.md`.
