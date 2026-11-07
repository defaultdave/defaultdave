# ADR 0002: Devcontainer for unattended agent sessions

- **Status:** Proposed 2026-11-07 by portfolio-pm, for Dave to accept. Not a plan unit; if accepted it is logged as a scope addition in `docs/plan/delta-log.md` before anyone builds it.
- **Depends on:** ADR 0001 (rules 1, 3, 8, 9), `~/Workspace/CLAUDE.md` (Paths)
- **Model:** `~/Workspace/robo-advisor/.devcontainer/` (Dockerfile, compose, `init-firewall.sh`, `post-create.sh`), read 2026-11-07.

## Context

Auto mode plus the macOS sandbox held up in the first `shell` round: the classifier refused a forced checkout, and the sandbox blocked a write into `.claude/`. It still lets commands write anywhere under `~/Workspace` and reach the network through a filtering proxy. The `page-*` swarm runs five agents at once, unattended. A container bounds the damage to the mounted folders and an egress allowlist.

Robo-advisor already has the pattern: a default-deny egress firewall (`iptables` and an `ipset` of GitHub ranges plus listed domains, applied on `postStartCommand`, with `NET_ADMIN` and `NET_RAW`), pnpm and Playwright dependencies, a bind mount of `../../dev-team` into the workspace, and a `post-create.sh`. Every folder an agent must read or delegate to has to be listed as a mount.

## Decision

1. **Port the robo-advisor devcontainer** to `.devcontainer/` in this repo, without the Postgres service, Prisma, the database scripts or the `alphavantage.co` and `binaries.prisma.sh` allowlist entries.
2. **Mounts:** this repo at its identical absolute host path, `/Users/davidfleming/Workspace/defaultdave` (accepted by Dave 2026-11-07; the `/workspace` rule from `~/Workspace/CLAUDE.md` is not used here), so worktree links resolve on both sides, and `vig` at its host path too, read-only so the global agents, skills and rules resolve. No `.env` files, no `~/.ssh`, no `~/.aws`. The container's `~/.claude` points at the mounted `vig/global`, as the host's symlinks do.
3. **Egress allowlist:** GitHub meta ranges, `registry.npmjs.org`, `api.anthropic.com`, `statsig.anthropic.com`, `sentry.io`, the Playwright browser CDN, and Vercel's API only if an agent needs it (default: no). Everything else is rejected.
4. **Node and pnpm:** base image on Node 26 (`.nvmrc`, `engines`), and pnpm pinned to `packageManager` (`pnpm@10.26.2`), not `pnpm@latest`.
5. **Merge-desk key stays on the host.** The `defaultdave-agents` App `.pem` is not mounted. Inside the container agents commit to `unit/*` branches; pushes, PRs and `post-check.ts` run from the host as today (ADR 0001 rule 1 and the sandbox exclusion). Revisit only if host-side pushing becomes the bottleneck, and then mount a key restricted to this repo, read-only.
6. **Anthropic credentials:** passed from the host environment (`${localEnv:ANTHROPIC_API_KEY}`), never written to a file in the repo or typed in chat.
7. **Scope of use:** the swarm and any long unattended run. Single-unit work with Dave watching can stay on the host.

## Open questions for Dave

1. **Worktrees. Settled 2026-11-07: option (a), identical absolute path.** `git worktree add` records absolute host paths (for example `/Users/davidfleming/Workspace/defaultdave/.claude/worktrees/...`). Mounted at `/workspace`, those links break, and `git worktree repair` run inside the container breaks them on the host. Options: (a) mount the repo at its identical absolute host path inside the container; (b) create and use worktrees only inside the container and prune them on the host afterwards; (c) give each swarm agent a separate clone volume. Recommended: (a), which keeps `~/Workspace/CLAUDE.md`'s `/workspace` rule for other projects and costs one mount line here.
2. **Where the container runs the PM chat.** If the PM chat itself moves into the container, the bypass push of bookkeeping must still happen from the host (rule 5). Recommended: the PM chat stays on the host, and only the swarm seniors run in the container.
3. **Timing.** Build it before the swarm starts (after `cms` merges) so it is in place for five parallel agents. Estimate: one human-led session, about an hour of Dave's time, mostly the first image build and the firewall check.

## Consequences

- Agent writes are confined to the two mounts, and egress is limited to the allowlist.
- A new file set under `.devcontainer/`, which is a protected-path-adjacent change: Dave pushes it (workflow and CI files are his).
- First build is slow (Playwright system packages); later starts are fast.
- Anything an agent needs beyond the allowlist fails loudly and is added by Dave, not by the agent.

## Alternatives considered

- **Host sandbox, strict mode only:** no image to maintain, but the writable area is still all of `~/Workspace` and three steps in this workflow already run outside it.
- **Cloud sessions (`target: "cloud"`):** strongest isolation, but no access to the local `vig` layer or the unpublished plan state.
- **Do nothing:** acceptable for one agent at a time with Dave present; weaker for an unattended swarm.
