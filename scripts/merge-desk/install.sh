#!/bin/bash
# Dave-run installer for the merge-desk launchers (ADR 0001, DECISIONS 2026-11-07, -08, -10).
#
# Usage: install.sh <40-hex sha> --checkout <dir>
#
# Exports scripts/merge-desk/ at <sha> from a fresh clone of origin/main into <prefix>/<sha>/ (read-only), writes the
# launchers agent-git and post-check and the hook command command-guard into <prefix>/bin/defaultdave/, and prints the
# settings blocks for the piece 4 cutover. It applies no setting. Run it yourself, outside any agent session, from a
# copy of this file under <prefix>/.staging/ (see the README). Bash 3.2 compatible (macOS) and GNU bash.
#
# Test flags exist for the test suite and are refused without --test-prefix:
#   --test-prefix <p>   use <p> in place of ~/.local/share/defaultdave-merge-desk
#   --test-source <r>   clone from <r> in place of the GitHub URL
#   --test-home <h>     treat <h> as the passwd home and the home the launchers set
#   --test-bin <d>      take node, gh and git from <d>
#   --yes               skip the confirmation prompt
set -euo pipefail
export LC_ALL=C

REPO_URL=https://github.com/defaultdave/defaultdave.git
SAFE_PATH='^/[A-Za-z0-9_./+@-]+$'

die() {
  echo "install: refused: $*" >&2
  exit 1
}
usage() {
  echo "usage: install.sh <40-hex sha> --checkout <dir> [--test-prefix <p> [--test-source <repo>] [--test-home <h>] [--test-bin <d>] [--yes]]" >&2
  exit 2
}

sha=""
checkout=""
test_prefix=""
test_source=""
test_home=""
test_bin=""
yes=0
while [ $# -gt 0 ]; do
  case "$1" in
    --checkout) [ $# -ge 2 ] || usage; checkout=$2; shift 2 ;;
    --test-prefix) [ $# -ge 2 ] || usage; test_prefix=$2; shift 2 ;;
    --test-source) [ $# -ge 2 ] || usage; test_source=$2; shift 2 ;;
    --test-home) [ $# -ge 2 ] || usage; test_home=$2; shift 2 ;;
    --test-bin) [ $# -ge 2 ] || usage; test_bin=$2; shift 2 ;;
    --yes) yes=1; shift ;;
    -*) usage ;;
    *) [ -z "$sha" ] || usage; sha=$1; shift ;;
  esac
done
[ -n "$sha" ] && [ -n "$checkout" ] || usage

# A full lowercase sha only: a short sha or a ref name can move.
printf '%s' "$sha" | grep -Eq '^[0-9a-f]{40}$' || die "$sha is not a full 40-character lowercase hex sha"

if [ -z "$test_prefix" ] && { [ -n "$test_source" ] || [ -n "$test_home" ] || [ -n "$test_bin" ] || [ "$yes" -eq 1 ]; }; then
  die "--test-source, --test-home, --test-bin and --yes need --test-prefix"
fi
test_mode=0
if [ -n "$test_prefix" ]; then
  test_mode=1
  echo "TEST MODE: --test-prefix is set. This is not a real install; every printed entry is marked [TEST]." >&2
fi

# ---- identity and roots
user=$(id -un)
if [ -n "$test_home" ]; then
  home=$test_home
elif [ "$(uname -s)" = Darwin ]; then
  home=$(dscl . -read "/Users/$user" NFSHomeDirectory 2>/dev/null | sed 's/^NFSHomeDirectory: //' || true)
else
  home=$(getent passwd "$user" | cut -d: -f6 || true)
fi
ws="${home:-${HOME:-}}/Workspace"
tmp_a=${TMPDIR:-}
tmp_a=${tmp_a%/}
tmp_b=""
if [ -n "$tmp_a" ] && [ -d "$tmp_a" ]; then tmp_b=$(realpath "$tmp_a"); fi

under() {
  case "$1" in "$2" | "$2"/*) return 0 ;; esac
  return 1
}
in_temp_roots() {
  local root
  for root in "$ws" /tmp /private/tmp /var/folders /private/var/folders "$tmp_a" "$tmp_b"; do
    if [ -n "$root" ] && [ "$root" != / ] && under "$1" "$root"; then return 0; fi
  done
  return 1
}

if [ -n "$test_prefix" ]; then
  prefix=$test_prefix
else
  prefix="${HOME:-}/.local/share/defaultdave-merge-desk"
  if in_temp_roots "$prefix"; then die "the prefix $prefix is under ~/Workspace or a temp root"; fi
fi
[ -n "$home" ] || die "cannot find the passwd home for $user"
[ "${HOME:-}" = "$home" ] || die "\$HOME (${HOME:-unset}) is not the passwd home ($home)"
printf '%s' "$home" | grep -Eq "$SAFE_PATH" || die "home $home has characters outside A-Za-z0-9_./+@-"
printf '%s' "$prefix" | grep -Eq "$SAFE_PATH" || die "prefix $prefix has characters outside A-Za-z0-9_./+@-"
printf '%s' "$user" | grep -Eq '^[A-Za-z0-9_.-]+$' || die "user name $user has unusual characters"
[ -d "$prefix" ] || die "$prefix does not exist; follow the Install steps in the README"
prefix_real=$(realpath "$prefix")

# ---- this script must be the staged copy
self=$(realpath "$0" 2>/dev/null) || die "cannot resolve this script's own path"
under "$self" "$prefix_real/.staging" && [ "$self" != "$prefix_real/.staging" ] ||
  die "this script ($self) is not under $prefix_real/.staging/; copy it there from a fresh clone (README, Install)"

# ---- binaries
if [ -n "$test_bin" ]; then
  node_given=$test_bin/node
  gh_given=$test_bin/gh
  git_given=$test_bin/git
else
  node_given=$(command -v node || true)
  gh_given=/opt/homebrew/bin/gh
  git_given=/Library/Developer/CommandLineTools/usr/bin/git
fi
resolve_binary() {
  local label=$1 given=$2 real
  [ -n "$given" ] && [ -x "$given" ] || die "$label not found${given:+ at $given}"
  real=$(realpath "$given")
  if in_temp_roots "$real"; then
    if [ "$test_mode" -eq 1 ] && under "$real" "$prefix_real"; then :; else
      die "$label resolves to $real, under ~/Workspace or a temp root"
    fi
  fi
  printf '%s' "$real" | grep -Eq "$SAFE_PATH" || die "$label path $real has characters outside A-Za-z0-9_./+@-"
  printf '%s\n' "$real"
}
node_real=$(resolve_binary node "$node_given")
gh_real=$(resolve_binary gh "$gh_given")
git_real=$(resolve_binary git "$git_given")

node_version=$(/usr/bin/env -i PATH=/usr/bin:/bin "$node_real" -p 'process.versions.node') || die "node does not run"
printf '%s' "$node_version" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+' || die "node reported version '$node_version'"
node_major=${node_version%%.*}
node_minor=${node_version#*.}
node_minor=${node_minor%%.*}
if [ "$node_major" -lt 24 ] || { [ "$node_major" -eq 24 ] && [ "$node_minor" -lt 2 ]; }; then
  die "node $node_version is older than 24.2 (import.meta.main)"
fi

sha256() {
  local out
  out=$(/usr/bin/shasum -a 256 "$1")
  printf '%s\n' "${out%% *}"
}

# ---- the App key name
conf="$home/.config/defaultdave-agents/app.conf"
[ -f "$conf" ] || die "$conf does not exist"
key=$(sed -n 's/^[[:space:]]*APP_KEY=//p' "$conf" | tail -n 1 | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e "s/^\\(['\"]\\)\\(.*\\)\\1\$/\\2/")
case "$key" in
  *.pem | *.key) ;;
  *) die "APP_KEY in $conf does not end in .pem or .key (the sandbox read-deny covers only those names)" ;;
esac

# ---- git with a clean environment
git_clean() {
  /usr/bin/env -i HOME="$home" PATH=/usr/bin:/bin GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null \
    GIT_NO_REPLACE_OBJECTS=1 GIT_NO_LAZY_FETCH=1 "$git_real" -c core.hooksPath=/dev/null "$@"
}

# The checkout's .git/config is agent-writable, so the one read of it also gets the safe-exec.ts HARDENING_KEYS through
# GIT_CONFIG_COUNT, which outranks every config file. install.test.ts keeps this list equal to HARDENING_KEYS.
HARDENING_KEYS=(
  core.hooksPath=/dev/null core.fsmonitor=false core.askPass= core.editor=false sequence.editor=false core.pager=cat
  core.sshCommand=false credential.helper= http.proxy= http.sslVerify=true http.followRedirects=false protocol.allow=never
  protocol.https.allow=always submodule.recurse=false push.recurseSubmodules=no fetch.recurseSubmodules=false
  commit.gpgSign=false tag.gpgSign=false transfer.fsckObjects=true
)
git_hardened() {
  local pair i=0 kv=()
  for pair in "${HARDENING_KEYS[@]}"; do
    kv+=("GIT_CONFIG_KEY_$i=${pair%%=*}" "GIT_CONFIG_VALUE_$i=${pair#*=}")
    i=$((i + 1))
  done
  /usr/bin/env -i HOME="$home" PATH=/usr/bin:/bin GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null \
    GIT_NO_REPLACE_OBJECTS=1 GIT_NO_LAZY_FETCH=1 GIT_CONFIG_COUNT="$i" "${kv[@]}" "$git_real" "$@"
}

[ -d "$checkout" ] || die "--checkout $checkout is not a directory"
checkout_real=$(realpath "$checkout")
common=$(git_hardened -C "$checkout_real" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) ||
  die "$checkout_real is not a git checkout"
[ "$common" = "$checkout_real/.git" ] || die "the git common dir of $checkout_real is $common, not $checkout_real/.git (a worktree or a redirected checkout)"

# ---- staging
mkdir -p "$prefix/.staging" "$prefix/tmp" "$prefix/bin"
chmod 700 "$prefix/tmp"
work=$(mktemp -d "$prefix/.staging/run.XXXXXX")
chmod 700 "$work"
cleanup() {
  if [ -d "$work" ]; then
    find "$work" -type d -exec chmod u+w {} + 2>/dev/null || true
    rm -rf "$work"
  fi
  if [ -n "${old_bin:-}" ] && [ -d "$old_bin" ]; then
    find "$old_bin" -type d -exec chmod u+w {} + 2>/dev/null || true
    rm -rf "$old_bin"
  fi
}
trap cleanup EXIT

source_url=${test_source:-$REPO_URL}
git_clean clone --quiet --bare --single-branch --branch main --no-tags "$source_url" "$work/clone.git" ||
  die "cannot clone $source_url"
engine() { git_clean --git-dir="$work/clone.git" "$@"; }
resolved=$(engine rev-parse --verify --quiet "$sha^{commit}" || true)
[ "$resolved" = "$sha" ] || die "$sha is not a commit on main"
engine merge-base --is-ancestor "$sha" refs/heads/main || die "$sha is not an ancestor of main"

# ---- the pin being replaced, and the confirmation
bin="$prefix/bin/defaultdave"
export_dir="$prefix/$sha"
old_pin=""
if [ -f "$bin/agent-git" ]; then
  old_pin=$(sed -n 's/^# Generated by scripts\/merge-desk\/install\.sh for \([0-9a-f]\{40\}\)\. .*/\1/p' "$bin/agent-git" | head -n 1)
fi
echo "Installing $sha (node $node_version)" >&2
if [ -n "$old_pin" ] && [ "$(engine rev-parse --verify --quiet "$old_pin^{commit}" || true)" = "$old_pin" ] &&
  engine merge-base --is-ancestor "$old_pin" "$sha" 2>/dev/null; then
  echo "Changes to scripts/merge-desk/ since the installed pin $old_pin:" >&2
  engine log --format='%h %an %s' "$old_pin..$sha" -- scripts/merge-desk/ >&2
else
  echo "No installed pin to compare with; the last 20 commits touching scripts/merge-desk/:" >&2
  engine log -n 20 --format='%h %an %s' "$sha" -- scripts/merge-desk/ >&2
fi
if [ "$yes" -eq 1 ]; then
  :
elif [ -t 0 ]; then
  read -r -p "Install $sha? Type y to continue: " reply || reply=""
  [ "$reply" = y ] || die "not confirmed"
else
  die "no terminal to ask on (stdin is not a terminal)"
fi

# ---- export
engine archive --format=tar "$sha:scripts/merge-desk" >"$work/export.tar" || die "$sha has no scripts/merge-desk/"
listing=$(tar -tvf "$work/export.tar")
nonregular=$(printf '%s\n' "$listing" | grep -v '^[-d]' || true)
[ -z "$nonregular" ] || die "the archive holds a non-regular entry: $(printf '%s' "$nonregular" | head -n 1)"
if tar -tf "$work/export.tar" | grep -Eq '(^|/)\.\.(/|$)|^/'; then die "the archive holds an absolute or parent path"; fi
exp="$work/export"
mkdir -m 700 "$exp"
tar -xf "$work/export.tar" -C "$exp"
[ -z "$(find "$exp" ! -type f ! -type d)" ] || die "the export holds a non-regular entry"
[ -z "$(find "$exp" -name package.json)" ] || die "scripts/merge-desk/ at $sha commits a package.json"
[ -f "$exp/safe-exec.ts" ] && [ -f "$exp/agent-git.ts" ] && [ -f "$exp/post-check.ts" ] &&
  [ -f "$exp/worktree.ts" ] && [ -f "$exp/command-guard.ts" ] || die "$sha lacks one of safe-exec.ts, agent-git.ts, post-check.ts, worktree.ts, command-guard.ts"

while IFS= read -r file; do
  if grep -Eq '(^|[^A-Za-z0-9_.])(import|require)[[:space:]]*\(' "$file"; then die "${file#"$exp"/} uses a dynamic import or require"; fi
  # Whole-line comments are skipped here only: prose may end a line with "from" or "import"; code never may.
  if grep -Ev '^[[:space:]]*(//|/\*|\*)' "$file" | grep -Eq '(^|[^A-Za-z0-9_])(from|import)[[:space:]]*$'; then die "${file#"$exp"/} splits an import across lines"; fi
  specs=$(grep -Eo "(^|[^A-Za-z0-9_])(from|import)[[:space:]]+['\"][^'\"]*['\"]" "$file" | sed -E "s/^.?(from|import)[[:space:]]+['\"]//; s/['\"]\$//" || true)
  while IFS= read -r spec; do
    [ -n "$spec" ] || continue
    printf '%s' "$spec" | grep -Eq '^(node:[a-z_]+(/[a-z_]+)*|\./[A-Za-z0-9_-]+\.ts)$' ||
      die "${file#"$exp"/} imports '$spec' (only node: modules and non-test ./<name>.ts)"
  done <<EOF
$specs
EOF
done <<EOF
$(find "$exp" -name '*.ts' ! -name '*.test.ts' | sort)
EOF

printf '{"type":"module"}\n' >"$exp/package.json"

expected=$(/usr/bin/env -i PATH=/usr/bin:/bin "$node_real" --input-type=module \
  -e 'const m = await import(process.argv[1]); process.stdout.write(String(m.EXPECTED_COMMON_DIR))' \
  "file://$exp/safe-exec.ts") || die "cannot read EXPECTED_COMMON_DIR from safe-exec.ts at $sha"
[ "$expected" = "$checkout_real/.git" ] ||
  die "EXPECTED_COMMON_DIR at $sha is $expected, not $checkout_real/.git"

lock_tree() {
  find "$1" -type f -exec chmod 444 {} +
  find "$1" -mindepth 1 -type d -exec chmod 555 {} +
}
has_write_bits() {
  [ -n "$(find "$1" ! -type l \( -perm -u=w -o -perm -g=w -o -perm -o=w \) | head -n 1)" ]
}
lock_tree "$exp"

if [ -e "$export_dir" ]; then
  if diff -r "$exp" "$export_dir" >/dev/null 2>&1 && ! has_write_bits "$export_dir"; then
    echo "$export_dir already holds this export; leaving it." >&2
  else
    die "$export_dir exists and differs from a fresh export of $sha (or is writable); remove it yourself if you mean to replace it"
  fi
else
  mv "$exp" "$export_dir"
  chmod 555 "$export_dir"
fi

# ---- launchers
new_bin="$work/bin"
mkdir -m 700 "$new_bin" "$new_bin/.stage" "$new_bin/.path"
ln -s "$node_real" "$new_bin/.path/node"
{
  printf '%s %s\n' "$(sha256 "$node_real")" "$node_real"
  printf '%s %s\n' "$(sha256 "$gh_real")" "$gh_real"
  printf '%s %s\n' "$(sha256 "$git_real")" "$git_real"
} >"$new_bin/.hashes"

header="# Generated by scripts/merge-desk/install.sh for $sha. Do not edit; rerun install."
env_words="HOME=$home USER=$user LOGNAME=$user TMPDIR=$prefix/tmp PATH=/usr/bin:/bin LANG=en_US.UTF-8"

write_launcher() {
  cat >"$new_bin/$1" <<LAUNCHER
#!/bin/bash -p
$header
exec /usr/bin/env -i $env_words \\
  /bin/bash -p $bin/.stage/$1 "\$@"
LAUNCHER
}
# The hook launcher must fail closed: Claude Code blocks a PreToolUse hook only on exit 2, so every failure maps to 2.
write_hook_launcher() {
  cat >"$new_bin/$1" <<LAUNCHER
#!/bin/bash -p
$header
/usr/bin/env -i $env_words /bin/bash -p $bin/.stage/$1 "\$@" || exit 2
LAUNCHER
}
write_stage() {
  local name=$1 run=$2 pin_code=${3:-4}
  cat >"$new_bin/.stage/$name" <<STAGE
#!/bin/bash -p
$header
set -euo pipefail
count=0
while read -r want path; do
  count=\$((count + 1))
  case \$count in 1) label=node ;; 2) label=gh ;; *) label=git ;; esac
  have=\$(/usr/bin/shasum -a 256 "\$path" 2>/dev/null) || have=missing
  if [ "\${have%% *}" != "\$want" ]; then
    echo "pin: \$label changed; rerun install" >&2
    exit $pin_code
  fi
done < $bin/.hashes
$run
STAGE
}
for name in agent-git post-check; do
  write_launcher "$name"
  write_stage "$name" "/usr/bin/env -i $env_words $bin/.path/node $export_dir/worktree.ts < /dev/null
exec /usr/bin/env -i $env_words $bin/.path/node $export_dir/$name.ts \"\$@\""
done
write_hook_launcher command-guard
write_stage command-guard "rc=0
/usr/bin/env -i $env_words $bin/.path/node $export_dir/command-guard.ts $bin/ || rc=\$?
if [ \"\$rc\" -ne 0 ] && [ \"\$rc\" -ne 2 ]; then
  echo \"command-guard: denied: guard failed with exit \$rc\" >&2
fi
[ \"\$rc\" -eq 0 ] || exit 2" 2

find "$new_bin" -type f ! -name .hashes -exec chmod 555 {} +
chmod 444 "$new_bin/.hashes"
chmod 555 "$new_bin/.stage" "$new_bin/.path"

old_bin=""
if [ -d "$bin" ] && diff -r "$new_bin" "$bin" >/dev/null 2>&1 && ! has_write_bits "$bin"; then
  echo "$bin is already current; leaving it." >&2
else
  if [ -e "$bin" ]; then
    old_bin="$prefix/bin/defaultdave.old.$$"
    mv "$bin" "$old_bin"
  fi
  if ! mv "$new_bin" "$bin"; then
    if [ -n "$old_bin" ] && [ -d "$old_bin" ] && mv "$old_bin" "$bin"; then old_bin=""; fi
    die "cannot move the new launchers into $bin; the previous launchers are restored"
  fi
  chmod 555 "$bin"
fi

# ---- the blocks to apply by hand
mark=""
if [ "$test_mode" -eq 1 ]; then mark="  [TEST]"; fi
entry() { printf '  %s%s\n' "$1" "$mark"; }
common_dir=$checkout_real/.git

echo "Installed $sha: export $export_dir, launchers $bin/"
echo "Nothing below is applied. Apply it yourself at the cutover (README, After the cutover)."
if [ "$test_mode" -eq 1 ]; then echo "TEST: these entries come from a test install and must not be applied."; fi
echo
echo "(a) Add to $checkout_real/.claude/settings.local.json"
echo "permissions.allow:"
entry "Bash($bin/agent-git *)"
entry "Bash($bin/post-check *)"
echo "sandbox.excludedCommands:"
entry "$bin/agent-git *"
entry "$bin/post-check *"
echo "hooks.PreToolUse, a Bash matcher whose hook command is:"
entry "$bin/command-guard"
echo
echo "(b) Remove from $checkout_real/.claude/settings.local.json"
echo "permissions.allow:"
entry "Bash(node scripts/merge-desk/agent-git.ts *)"
entry "Bash(node scripts/merge-desk/post-check.ts *)"
entry "Bash(node scripts/merge-desk/app-token.ts)"
entry "Bash(scripts/merge-desk/revert.sh *)"
entry "Bash(gh pr *)"
entry "Bash(gh api *)"
entry "Bash(gh project *)"
echo "sandbox.excludedCommands:"
entry "node scripts/merge-desk/agent-git.ts"
entry "node scripts/merge-desk/post-check.ts"
entry "node scripts/merge-desk/app-token.ts"
entry "scripts/merge-desk/revert.sh"
echo
echo "(c) Add to the sandbox read-deny (sandbox.filesystem.denyRead) of $checkout_real/.claude/settings.local.json"
entry "~/.config/defaultdave-agents"
entry "~/.config/gh"
echo
echo "(d) Remove from $ws/.claude/settings.local.json every permissions.allow entry that starts with"
entry "Bash(git push"
entry "Bash(gh pr "
entry "Bash(gh api"
entry "Bash(gh issue"
entry "Bash(gh secret"
entry "Bash(gh run"
echo
echo "(e) Add to the sandbox write-deny (sandbox.filesystem.denyWrite) of $home/.claude/settings.json"
entry "$ws/.claude/**"
entry "$ws/**/.claude/settings*.json"
entry "**/.claude/hooks/**"
entry "**/.mcp.json"
entry "$ws/vig/.claude/**"
entry "$common_dir/hooks/**"
entry "$common_dir/config"
entry "$common_dir/worktrees/*/config.worktree"
