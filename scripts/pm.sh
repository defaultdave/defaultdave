#!/usr/bin/env bash
# PM helpers for the portfolio build.
#   scripts/pm.sh check              STATUS.md under 25 KB and has the required sections
#   scripts/pm.sh board <number>     gh project item-add lines for every issue number in STATUS.md
#   scripts/pm.sh units              the Units table from STATUS.md
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATUS="$ROOT/docs/plan/STATUS.md"
case "${1:-}" in
  check)
    size=$(wc -c < "$STATUS" | tr -d ' ')
    fail=0
    [ "$size" -le 25600 ] || { echo "STATUS.md is $size bytes, over 25 KB: move history to DECISIONS.md or delta-log.md" >&2; fail=1; }
    for h in "## Units" "## Blocked on Dave" "## Next" "## Next chat"; do grep -q "^$h" "$STATUS" || { echo "STATUS.md missing section: $h" >&2; fail=1; }; done
    [ $fail -eq 0 ] && echo "STATUS.md ok ($size bytes)"; exit $fail;;
  board)
    [ -n "${2:-}" ] || { echo "usage: pm.sh board <project-number>" >&2; exit 1; }
    grep -oE '\| #[0-9]+ \|' "$STATUS" | grep -oE '[0-9]+' | sort -un | while read -r n; do
      echo "gh project item-add $2 --owner defaultdave --url https://github.com/defaultdave/defaultdave/issues/$n"
    done;;
  units) sed -n '/^## Units/,/^## /p' "$STATUS" | grep '^|';;
  *) sed -n '2,5p' "$0"; exit 1;;
esac
