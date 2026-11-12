#!/usr/bin/env bash
# Opens a revert PR for a merged PR; it runs the same required checks and auto-merges (ADR 0001 rule 10).
# Usage: scripts/merge-desk/revert.sh <pr-number>
# Everything that touches GitHub goes through the agent-git launcher as the App; the read-only `gh pr view` calls use
# Dave's login, which only reads.
set -euo pipefail
pr="${1:?usage: revert.sh <pr-number>}"
case "$pr" in *[!0-9]* | "") echo "revert.sh: $pr is not a PR number" >&2; exit 1 ;; esac
bin=/Users/davidfleming/.local/share/defaultdave-merge-desk/bin/defaultdave
[ -x "$bin/agent-git" ] || { echo "revert.sh: launcher $bin/agent-git is not executable" >&2; exit 1; }
repo=defaultdave/defaultdave
base=$(gh pr view "$pr" --repo "$repo" --json baseRefName -q .baseRefName)
sha=$(gh pr view "$pr" --repo "$repo" --json mergeCommit -q .mergeCommit.oid)
title=$(gh pr view "$pr" --repo "$repo" --json title -q .title)
branch="revert/pr-$pr"
if [ "$base" != "main" ]; then
  echo "PR $pr targeted $base, not main; nothing to revert here." >&2
  exit 1
fi
# Units squash-merge, so the merge commit has one parent. More than one means Dave merged it another way.
if [ "$(git rev-list --parents -n 1 "$sha" | wc -w)" -gt 2 ]; then
  echo "PR $pr landed as a merge commit. Auto-merge cannot revert it: Dave reverts it with break-glass." >&2
  exit 1
fi
git fetch origin "$base"
git switch -c "$branch" "origin/$base"
git revert --no-edit "$sha"
"$bin/agent-git" push "$branch"
"$bin/agent-git" pr "$base" "Revert: $title" --body "Reverts #$pr (merge commit $sha)."
"$bin/agent-git" review "$branch"
"$bin/agent-git" automerge "$branch"
# Auto-merge is only queued. The revert merges after the CI and security checks pass and the four agent checks
# are posted for this head sha (post-check verdict) and, while the approval window is open, Dave approves. This
# script does not run the reviewers.
echo "Revert PR queued on $(git rev-parse HEAD). Run /review-pr, then post-check verdict for each agent." >&2
