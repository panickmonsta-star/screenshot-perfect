<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AGENTS.md

## Milestone 1 — frontend only

- **No Lovable Cloud / no backend provisioning.** The owner supplies their own
  Supabase project in Milestone 2; never call cloud-enable tools or generate
  credentials. (Also saved to project memory.)
- **All data flows through the service layer** in `src/services/`. UI components
  must not import from `src/data/mock/` or hardcode arrays; they call services
  and TanStack Query options. To go live, swap the mock service objects for real
  implementations keeping the same interfaces.
- **Mock reality**: auth, payments, unlocks, downloads and analytics are demo
  behaviour. Never present them as real; keep the "preview/demo data" wording in
  the UI wherever money or security is involved.
- Domain models live in `src/types/domain.ts` and mirror the future Supabase
  schema.
- The public site is dark-only by design; design tokens live in `src/styles.css`
  (near-black charcoal surfaces, gold primary, violet secondary).
