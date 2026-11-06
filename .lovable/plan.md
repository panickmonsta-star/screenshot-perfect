# Panick Monsta — Supabase Backend Milestone

## Goal
Replace the current demonstration services with a secure, persistent backend on the already-connected Supabase project, while preserving the existing Panick Monsta design. Do not enable Lovable Cloud.

## Phases
1. **Foundation and data security** — reconcile Supabase SDK/runtime configuration; migrate the app schema and tightly scoped grants/RLS; preserve existing Supabase data and policies; support user profiles and protected role assignments; establish the requested initial admin safely.
2. **Real accounts and catalog** — connect registration, sign-in, email confirmation/recovery, profiles, session-aware navigation, published series/episodes, and role-gated admin pages to Supabase.
3. **Wallet and payments** — persist coin packages, payment attempts and transaction ledger; add Xendit QRIS, GoPay, DANA, and bank-transfer checkout; verify callbacks and credit coins exactly once; make episode unlock debit and entitlement creation atomic.
4. **Protected media and downloads** — close public access to protected source video; add entitlement-checked playback and download authorization; support admin download selection including first-five episode bundles. Cloudflare Stream/R2 provisioning and credentials are prerequisites.
5. **Admin, verification, and handoff** — connect catalog/package/user/download/settings management and analytics; add tests for auth boundaries, role checks, payment idempotency, concurrent unlocks, and media access; verify workflows and document required provider configuration and remaining limits.

## External setup and prerequisites
- Xendit App connector is unavailable; create a secure project connection for its API key after the checkout/webhook endpoints are prepared. Account-specific channel activation, live credentials, and callback configuration must be completed by the owner.
- Cloudflare connector must be linked for the selected Cloudflare Stream + R2 infrastructure. Provisioning these services is a paid-resource mutation and needs explicit confirmation before any account changes. The exact account, Stream, and R2 configuration will be confirmed before provisioning.
- Existing Supabase buckets include a **public** `videos` bucket. Changing its public setting can disrupt any currently published public video links; inspect/reconcile current media usage and obtain approval before privatizing or replacing it. New bucket access policies alone do not secure files in the existing public bucket.
- The supplied first-admin email will be granted a role only after the matching verified Supabase user exists; do not create or privilege an account from an unverified email string.

## Technical approach
- Use the project's TanStack Start server functions for authenticated application operations and public server routes only for externally called webhooks/stream responses; verify identity and roles server-side.
- Use database-side transactions/functions for atomic coin debit + entitlement and idempotent webhook ledger credit; clients cannot set balances, payment status, or roles.
- Keep provider secrets server-only; preserve public catalog behavior while protecting private wallet/account/media responses.
- Reuse existing domain/service interfaces where sound; replace mock service implementations and session flows rather than redesigning the UI.
- Add/alter schema only via Supabase migration tooling and preserve existing data. Never edit generated Supabase types manually.

## Validation and handoff
- Run relevant existing and newly added tests, inspect build/runtime signals, and exercise public, signed-in, admin, payment-callback, unlock, and media authorization flows where credentials and provider setup permit.
- Clearly distinguish any untestable live provider behavior; provide the exact owner steps for Xendit and Cloudflare activation, credentials, webhook URL, and deployment configuration.
