@AGENTS.md

## Working rules for this project

- Work in small steps. Finish, build and lint each step before starting the next. Stop and report after each step.
- Read node_modules/next/dist/docs/ before using routing, caching, proxy/middleware, server actions or headers. This Next.js version differs from older ones.
- Database: the live schema is the source of truth. Ask me to run a query when you need its state. Never guess table, column or enum names.
- Migrations live in supabase/migrations/ as YYYYMMDDHHMM_name.sql. Make them re-runnable (IF NOT EXISTS, DO blocks). Never drop data. I apply them by hand.
- Never write to the database with the anon key from server code. Writes that come from buyers go through server actions using the server-only admin client.
- Secrets have no NEXT_PUBLIC_ prefix. Modules that read them start with import "server-only". Add new env vars to .env.example.
- Every admin action checks requireAdmin() first. Every server action re-validates input with zod, even if the client already did.
- Brand copy: formal "you", short sentences, no exclamation marks, no emojis, no urgency wording, no discounts or strikethrough prices. Sold works show "Sold" with no price. Reserved works show the price with a "Reserved" label.
- One price, in USD, everywhere.
- Never render user input as HTML. Escape it for Telegram messages.
- Public pages use the cookie-free public client and must not show hidden works (Coming-soon series).
- Before finishing: npm run build and npm run lint must pass.
- Commits and PRs have no AI attribution lines (no Co-Authored-By, no "Generated with" lines).