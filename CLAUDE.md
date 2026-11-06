# defaultdave: davidfleming.me

Personal portfolio site. Next.js App Router on Vercel, Keystatic git-based CMS at `/keystatic`, MDX content in `content/`, CSS Modules, fully static.

- **Plan:** `docs/plan/` (frozen 2026-11-06). Live state: `docs/plan/STATUS.md`, `DECISIONS.md`, `delta-log.md`, `time-log.csv`. Design doc: `docs/designs/2026-11-06-portfolio-site.md`.
- **PM:** `/portfolio-pm` (desktop) or `claude --agent portfolio-pm` (terminal). Start there for status, "what's next", bookkeeping, or to start a unit.
- **Tickets:** `docs/plan/tickets/<nn>-<id>.md`, one per plan unit, each with a scope manifest. Implement with `/senior <ticket path>`.
- **Standards:** `.claude/standards/stack-decisions.md` settles the per-project rules; `~/.claude/standards/react-nextjs.md` and `architecture.md` are the full sets.
- **Time:** `scripts/track.sh start <unit>` / `stop` / `sum` for work outside Claude.
- **Secrets:** never in chat, tickets or the repo. Keystatic and Vercel values go from the console to the Vercel env store and `.env`.
- **Content rules:** ResortPass anonymized and NDA-safe unless `DECISIONS.md` says otherwise; nothing from the Multi Media LLC loop; no em dashes or "not just X, it's Y" in published copy.
