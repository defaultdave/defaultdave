# pm memory (public)

One line per fact; detail in linked files beside this one. Written for a reader who has never seen the project.

- The plan is frozen as of 2026-11-06 in `docs/plan/`; reality goes in `STATUS.md`, `DECISIONS.md`, `delta-log.md`, `time-log.csv`.
- Routes and the critical path are in `docs/plan/plan-report.md`; rerun `node ~/.claude/skills/plan-project/bin/plan.mjs docs/plan/plan.json` after any `plan.json` change.
- Agent units start only after the scaffold's CI gates exist and `preflight.md` is fully ticked.
- Reference class: Ramble closed 36 units at 29% of likely; expect build units to finish early and the writing and design units to set the date.
- [PR images](pr-images.md) — visual PRs need images; before and after for changes to existing UI
- Agent GitHub writes go through the absolute-path launchers `agent-git` and `post-check` (one call per command, single-quoted bodies); `command-guard` denies `;`, `$(`, double quotes, env prefixes and `bash -c` around them. Verified by live probes and the launcher dry run, 2026-11-11.
- GitHub reads any closing keyword in a PR body, even negated: "Does not close #17" closed #17 on merge. Write "Refs #N" for a partial PR. Learned 2026-11-12.
- Dependency adds (`pnpm add`) fail in an agent sandbox on worktrees installed with the sandbox off (pnpm store mismatch); the owner runs them. Learned 2026-11-12.
- `scope-manifest` needs bookkeeping PRs on a `pm/<slug>` branch and unit PRs on `unit/<id>[-slug]` with a title starting `<id>:`; protected-path PRs (`.github/`, `scripts/merge-desk/`) fail it by design and the owner bypass-merges.
