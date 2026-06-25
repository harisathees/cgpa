#!/usr/bin/env bash
#
# CGPA — one-command bootstrap.
# Clones the repo (if not already present) and runs the full setup
# (install deps + migrate + seed) for backend and frontend.
#
#   Run it from anywhere — it does not need to live inside the repo:
#     curl -fsSL https://raw.githubusercontent.com/harisathees/cgpa/main/bootstrap.sh | bash
#   or download it and run:
#     ./bootstrap.sh [target-dir]
#
# Prerequisites: git, Node.js 20+, npm, and a running MySQL 8 server.

set -euo pipefail

REPO_URL="https://github.com/harisathees/cgpa.git"
TARGET_DIR="${1:-cgpa}"   # where to clone into (default: ./cgpa)

bold="$(tput bold 2>/dev/null || true)"; reset="$(tput sgr0 2>/dev/null || true)"
blue="$(tput setaf 4 2>/dev/null || true)"; red="$(tput setaf 1 2>/dev/null || true)"
step() { printf "\n%s==> %s%s\n" "$bold$blue" "$1" "$reset"; }
die()  { printf "%s!!! %s%s\n" "$bold$red" "$1" "$reset" >&2; exit 1; }

command -v git >/dev/null 2>&1 || die "git is not installed."

step "Cloning $REPO_URL"
if [ -d "$TARGET_DIR/.git" ]; then
  echo "    '$TARGET_DIR' already cloned — pulling latest."
  git -C "$TARGET_DIR" pull --ff-only
else
  [ -e "$TARGET_DIR" ] && die "'$TARGET_DIR' already exists and is not a git repo."
  git clone "$REPO_URL" "$TARGET_DIR"
fi

step "Running setup in $TARGET_DIR"
cd "$TARGET_DIR"
chmod +x setup.sh 2>/dev/null || true
exec ./setup.sh
