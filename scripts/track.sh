#!/usr/bin/env bash
# Time tracker for work done outside Claude (reading, Figma, writing, console setup).
#   scripts/track.sh start <unit> [note]   open an interval for a plan unit
#   scripts/track.sh stop  [note]          close the open interval
#   scripts/track.sh status                show the open interval, if any
#   scripts/track.sh sum   [unit]          minutes per unit, or for one unit
# Rows land in docs/plan/time-log.csv: unit,start,stop,minutes,where,note. "where" is "outside"
# for these rows; owner minutes spent inside Claude come from transcript timestamps instead.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/docs/plan/time-log.csv"
OPEN="$ROOT/.time-log-open"
now() { date +%Y-%m-%dT%H:%M:%S; }
case "${1:-}" in
  start)
    [ -n "${2:-}" ] || { echo "usage: track.sh start <unit> [note]" >&2; exit 1; }
    [ ! -f "$OPEN" ] || { echo "an interval is already open: $(cat "$OPEN")" >&2; exit 1; }
    printf '%s,%s,%s\n' "$2" "$(now)" "${3:-}" > "$OPEN"; echo "started $2 at $(now)";;
  stop)
    [ -f "$OPEN" ] || { echo "no open interval" >&2; exit 1; }
    IFS=, read -r unit start note < "$OPEN"
    stop="$(now)"
    s=$(date -j -f %Y-%m-%dT%H:%M:%S "$start" +%s 2>/dev/null || date -d "$start" +%s)
    e=$(date -j -f %Y-%m-%dT%H:%M:%S "$stop" +%s 2>/dev/null || date -d "$stop" +%s)
    mins=$(( (e - s + 30) / 60 ))
    note="${2:-$note}"
    printf '%s,%s,%s,%s,outside,"%s"\n' "$unit" "$start" "$stop" "$mins" "${note//\"/\"\"}" >> "$LOG"
    rm -f "$OPEN"; echo "stopped $unit: $mins min";;
  status)
    if [ -f "$OPEN" ]; then echo "open: $(cat "$OPEN")"; else echo "no open interval"; fi;;
  sum)
    awk -F, -v u="${2:-}" 'NR>1 && (u=="" || $1==u) { m[$1]+=$4 } END { for (k in m) printf "%-20s %5d min  %5.1f h\n", k, m[k], m[k]/60 }' "$LOG" | sort;;
  *) sed -n '2,8p' "$0"; exit 1;;
esac
