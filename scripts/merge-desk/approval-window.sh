#!/usr/bin/env bash
# Dave only: opens or closes the approval window on the main ruleset (ADR 0001 rule 7).
#   on:  every PR into main needs 1 approval, dismissed when new commits land
#   off: back to 0 approvals; the required checks alone merge a PR
# Usage: scripts/merge-desk/approval-window.sh on|off   (needs Dave's gh login; the App cannot change rulesets)
set -euo pipefail
repo=defaultdave/defaultdave
name="main: merge desk"
case "${1:-}" in
  on) count=1 dismiss=true ;;
  off)
    count=0 dismiss=false
    echo "Closing the window needs Ramble's agent tokens restricted to defaultdave/ramble first (ADR 0001 Consequences)." >&2
    ;;
  *) echo "usage: $0 on|off" >&2; exit 1 ;;
esac
id=$(gh api "repos/$repo/rulesets" -q ".[] | select(.name == \"$name\") | .id")
if [ -z "$id" ]; then echo "no ruleset named '$name' in $repo" >&2; exit 1; fi
gh api "repos/$repo/rulesets/$id" |
  jq --argjson count "$count" --argjson dismiss "$dismiss" '{name, target, enforcement, conditions, bypass_actors,
    rules: [.rules[] | if .type == "pull_request"
      then .parameters.required_approving_review_count = $count | .parameters.dismiss_stale_reviews_on_push = $dismiss
      else . end]}' |
  gh api -X PUT "repos/$repo/rulesets/$id" --input - \
    -q '.name + ": approvals " + (.rules[] | select(.type == "pull_request") | .parameters.required_approving_review_count | tostring)'
