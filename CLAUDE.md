@AGENTS.md

# Project context

Online gallery and store for paintings. Next.js App Router + TypeScript + Tailwind + Supabase.

## Commands
- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — production build (run before finishing a change)
- `npm run lint` — ESLint

## Layout
- `app/(site)/` public pages, `app/admin/(protected)/` admin pages guarded by `middleware.ts` (`/admin/:path*`)
- Data access goes through `lib/supabase/` (separate browser, server and middleware clients) and server actions in `lib/actions/`
- Shared types live in `lib/types/`; inquiry validation in `lib/inquiries/validation.ts`

## Rules
- Never commit `.env*` files; new environment variables go into `.env.example`
- Keep secrets server-side: only `NEXT_PUBLIC_*` variables may be used in client components
- Prefer server components and server actions; add `"use client"` only where interactivity needs it
