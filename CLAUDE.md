# defaultdave: davidfleming.me

Personal portfolio site. Next.js App Router on Vercel, Keystatic git-based CMS at `/keystatic`, MDX content in `content/`, CSS Modules, fully static.

- **Plan:** `docs/plan/` (frozen 2026-11-06). Live state: `docs/plan/STATUS.md`, `DECISIONS.md`, `delta-log.md`, `time-log.csv`. Design doc: `docs/designs/2026-11-06-portfolio-site.md`.
- **PM:** `/pm` (desktop) or `claude --agent pm` (terminal); the global `pm` agent loads this project's card at `.claude/pm.md`. Start there for status, "what's next", bookkeeping, or to start a unit.
- **Tickets:** GitHub issues #1 to #21 on `defaultdave/defaultdave`, one per plan unit, each with a scope manifest; numbers in the Units table of `STATUS.md`. The issue is the only copy: agents tick criteria and add dated Amendment sections in the issue body and comment on each change. Implement with `/senior #<n>`.
- **Standards:** `.claude/standards/stack-decisions.md` settles the per-project rules; `~/.claude/standards/react-nextjs.md` and `architecture.md` are the full sets.
- **Time:** `scripts/track.sh start <unit>` / `stop` / `sum` for work outside Claude.
- **Agents and GitHub:** agents push, open PRs, post checks, queue auto-merge, and write issue comments, issue body edits and PR body edits (`node scripts/merge-desk/agent-git.ts issue-comment <n> --body '<text>'`, body single-quoted, `'\''` for a quote, no redirect, heredoc or pipe) only through `scripts/merge-desk/` as the `defaultdave-agents` App, never with Dave's login (ADR 0001, from the `merge-desk` unit on). Dave owns the App, rulesets, secrets, bypass merges and workflow files.
- **Secrets:** never in chat, tickets or the repo. Keystatic and Vercel values go from the console to the Vercel env store and `.env`.
- **Content rules:** ResortPass anonymized and NDA-safe unless `DECISIONS.md` says otherwise; nothing from the Multi Media LLC loop; no em dashes or "not just X, it's Y" in published copy.
