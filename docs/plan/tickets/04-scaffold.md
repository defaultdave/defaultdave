# Next.js app with strict TS, lint, format, Knip, Vitest, Playwright smoke, CI and Vercel link

Plan unit `scaffold` · Route: human-led · Depends on: `preflight` · Expected 0.5 days (0.25 / 0.5 / 1)

## Outcome

A Next.js app that builds, lints, typechecks and tests green in CI on every PR, deploys previews from Vercel, and carries every tool stack-decisions.md names.

## Acceptance criteria

- [ ] pnpm create next-app on the current stable release; App Router, TypeScript, src/ layout; packageManager and engines pinned
- [ ] tsconfig strict with exactOptionalPropertyTypes; typescript-eslint strict-type-checked; Prettier; Knip; React Compiler on; next typegen on
- [ ] Vitest with one passing example test in src/lib; Playwright with one smoke test hitting / and asserting a single h1, run with --trace off
- [ ] GitHub Actions per `~/.claude/skills/plan-project/references/project-setup.md` section C: `ci.yml` with a gate matrix (format:check, lint, typecheck, test, build, knip) and an `e2e` job (Playwright smoke with axe, --trace off); `codeql.yml`, `gitleaks.yml`, `osv-scanner.yml` with an empty `osv-scanner.toml`, `dependabot.yml`; third-party actions pinned by SHA, minimum `permissions:`, `persist-credentials: false`
- [ ] `.nvmrc` with the Node major; Dave adds the CI job names to the `main` ruleset once this merges (merge-desk)
- [ ] Vercel project linked to the repo; a PR gets a preview URL comment
- [ ] README.md states the stack, the scripts, and how to run Keystatic locally (placeholder until cms)
- [ ] Quality gates pass: build, lint, typecheck, test

## Scope

```
SCOPE MANIFEST:
  IN SCOPE:
    - pnpm create next-app on the current stable release; App Router, TypeScript, src/ layout; packageManager and engines pinned
    - tsconfig strict with exactOptionalPropertyTypes; typescript-eslint strict-type-checked; Prettier; Knip; React Compiler on; next typegen on
    - Vitest with one passing example test in src/lib; Playwright with one smoke test hitting / and asserting a single h1, run with --trace off
    - GitHub Actions workflow runs build, lint, typecheck, test on pull_request and push to main; all four are the required checks
    - Vercel project linked to the repo; a PR gets a preview URL comment
    - README.md states the stack, the scripts, and how to run Keystatic locally (placeholder until cms)
    - Quality gates: build, lint, typecheck, test
  OUT OF SCOPE:
    - shell (no tokens, nav or layout beyond the default)
    - cms (no Keystatic)
    - Everything under "Will not do" in docs/plan/brief.md
  in_scope_globs:
    - package.json
    - pnpm-lock.yaml
    - tsconfig.json
    - eslint.config.*
    - prettier.config.*
    - knip.json
    - vitest.config.*
    - playwright.config.*
    - next.config.*
    - .github/workflows/ci.yml
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/lib/**
    - e2e/**
    - README.md
```

## Intended precedent

~/.claude/standards/react-nextjs.md SET rules; .claude/standards/stack-decisions.md in this repo.

## Open questions

None. Dave leads; /senior types.

## Notes from the plan

Human-led: Dave decides, /senior types. Estimate is Dave's attention, not elapsed typing.
