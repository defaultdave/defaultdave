# Decisions: davidfleming.me

Append-only. One line per decision: date, decision, who, why. Overrides of the PM's recommendation are logged the same way.

| Date | Decision | Who | Why |
|---|---|---|---|
| 2026-11-06 | Outcome is the job search: recruiters see shipped work, perf case studies and code in two minutes | Dave | Job search open since 2026-08-31 with no single link |
| 2026-11-06 | Appetite 2 weeks; hours raised 15 to 25 to 30 a week; timing is measured, not promised | Dave | Writing and design units cannot be delegated; "don't worry horribly about the timing estimate" |
| 2026-11-06 | First milestone: Home + Work + ResortPass case study live | Dave | Smallest thing that goes into an application |
| 2026-11-06 | Domain davidfleming.me, one domain only | Dave | Picked over defaultdave.* after seeing availability; redirect domains are a non-goal |
| 2026-11-06 | Repo named `defaultdave`; plan committed with the repo | Dave | Personal project, no client terms |
| 2026-11-06 | CMS is Keystatic (git-based) with a thin optional AI route later; not Payload, not Sanity | Dave | Fits the appetite; content is already markdown; zero hosting cost |
| 2026-11-06 | No in-site AI assistant in v1; Claude Code edits the repo locally | Dave | The assistant only pays off away from the laptop; deferred |
| 2026-11-06 | Music is embeds only | Dave | No media ops |
| 2026-11-06 | Non-goals: comments, newsletter, contact form; search and tags; custom admin; custom analytics, A/B, i18n; self-hosted audio; redirect domains | Dave | Keep v1 inside two weeks |
| 2026-11-06 | Work list: ResortPass (anonymized, NDA-safe), gallery perf + CrUX article, vig/dev-team, side-project cards | Dave | |
| 2026-11-06 | Articles: Tuscany Rule (also on LinkedIn), CrUX article, links to published pieces | Dave | |
| 2026-11-06 | Design first: a Figma file and a Claude Design artifact of the same design, compared; one token source of truth signed off | Dave | Wants to compare the two tools and try options interactively |
| 2026-11-06 | `shell` routed agent fan-out with a token-check gate; `scaffold` pinned human-led; `page-work`, `page-writing`, `seo-perf` pinned agent fan-out | PM, Dave agreed | Uncertainty 1 on all; on the path only as longest siblings; scaffold is the foundation |
| 2026-11-06 | Time tracker: `scripts/track.sh` for outside work, transcript timestamps for inside work | Dave | Ramble recorded owner minutes as 0 or blank; measure this time |
| 2026-11-06 | PM is `portfolio-pm` (agent + `/portfolio-pm` skill), modeled on ramble-pm without lanes or a roadmap site; STATUS.md capped at 25 KB, current state only | Dave asked, PM shaped | Ramble audit: status file bloat and PM deciding for Dave were the two biggest costs |
| 2026-11-06 | Run the portfolio like any project, on the Ramble model: public repo, `defaultdave-agents` GitHub App, ruleset with CI, scope-manifest and agent checks, merge-desk scripts ported, one tier, approval window on at the start. New `merge-desk` unit after `scaffold`; every fan-out unit depends on it. Rules of record in `docs/adr/0001-agent-workflow-and-merge-rule.md` (Proposed; Dave to accept). Reusable runbook saved to the plan-project skill as `references/project-setup.md` | Dave asked, PM shaped | Ramble's breakdown forgot this unit and added it after the freeze |
| 2026-11-06 | Repo `defaultdave/defaultdave` is private, overriding the preflight recommendation and the "public repo" part of the Ramble-model decision. Flipping it public at launch stays open. Consequences: the site's own code is not visible to recruiters; Actions minutes are capped by the plan; private vulnerability reporting (public repos only) drops from repo settings; secret scanning needs a paid add-on on private repos, so push protection may be unavailable; rulesets appear available (branch-protection API answered normally on a private repo) | Dave | Dave's call |
