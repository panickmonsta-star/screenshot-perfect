# Roadmap — Milestone 1: Short-drama streaming platform frontend

Frontend-only build. No Lovable Cloud, no Supabase — user provides their own backend later.
All data comes from mock services behind a replaceable data-access layer.

## Foundation
- [x] Design system (dark cinematic, gold accent) in src/styles.css
- [x] Domain types (src/types/domain.ts)
- [x] Format helpers (src/lib/format.ts)
- [x] Mock seed data: 8 series, 5+ eps each, coin packages, users, transactions, analytics
- [x] Poster artwork (generated, original)

## Data-access layer (src/services)
- [x] auth.service.ts — mock sign up/in/out, reset password, profile
- [x] catalog.service.ts — series + episodes
- [x] wallet.service.ts — balance + coin packages (no real payments)
- [x] transactions.service.ts — history with filters + pagination
- [x] library.service.ts — unlocked, recently watched, continue watching
- [x] media.service.ts — playback info + download requests (mock)
- [x] admin.service.ts — analytics + admin CRUD
- [x] queries.ts — TanStack Query queryOptions used by routes

## Public site
- [x] / home (hero, trending, popular, new, recommended, genres, search, continue watching)
- [x] /explore (search, genre filter, sort, grid, empty/loading/error states)
- [x] /series/$slug (details + episode list + unlock actions)
- [x] /watch/$slug/$episode (player, nav, drawer, coin balance, unlock modal, download)
- [x] /login /signup /forgot-password /reset-password (mock auth, clearly labelled)
- [x] /profile + sign-out confirmation
- [x] /wallet (balance, IDR packages, purchase confirm, activity)
- [x] /transactions (history, filters, pagination)
- [x] /library (unlocked, continue watching, recently watched)

## Admin (/admin, sidebar layout)
- [x] Overview (preview-labelled stats, charts, date filter)
- [x] Series management (CRUD, status, search, sort, pagination)
- [x] Episode management (CRUD, free/paid, coin price, ordering, download toggle)
- [x] Coin package management (CRUD + user-facing preview)
- [x] User management (list, status, balance, tx preview)
- [x] Transactions
- [x] Promotional download settings (first-5-episodes bulk + individual, watermark config)
- [x] Platform settings (branding, IDR default, provider placeholders, no secrets)

## Wrap-up
- [x] .env.example with placeholder values only
- [x] Route head() metadata on every content route
- [x] Verify: build clean, existing tests pass, Playwright walkthrough of key pages
- [x] AGENTS.md note: mock services only, no cloud
