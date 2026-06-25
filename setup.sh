#!/usr/bin/env bash
#
# CGPA — full local setup.
# Installs dependencies for backend + frontend, sets up env files, then runs
# Prisma migrations and seeds the ADMIN user.
#
#   Usage:  ./setup.sh
#
# Prerequisites: Node.js 20+, npm, and a running MySQL 8 server reachable via
# the DATABASE_URL in backend/.env.

set -euo pipefail

# Resolve the repo root (this script's directory) so it works from anywhere.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# ── Output helpers ────────────────────────────────────────────────────────────
bold="$(tput bold 2>/dev/null || true)"; reset="$(tput sgr0 2>/dev/null || true)"
green="$(tput setaf 2 2>/dev/null || true)"; yellow="$(tput setaf 3 2>/dev/null || true)"
red="$(tput setaf 1 2>/dev/null || true)"; blue="$(tput setaf 4 2>/dev/null || true)"

step() { printf "\n%s==> %s%s\n" "$bold$blue" "$1" "$reset"; }
info() { printf "%s    %s%s\n" "$green" "$1" "$reset"; }
warn() { printf "%s    %s%s\n" "$yellow" "$1" "$reset"; }
die()  { printf "%s!!! %s%s\n" "$bold$red" "$1" "$reset" >&2; exit 1; }

# ── Prerequisites ─────────────────────────────────────────────────────────────
step "Checking prerequisites"
command -v node >/dev/null 2>&1 || die "Node.js is not installed (need v20+)."
command -v npm  >/dev/null 2>&1 || die "npm is not installed."
info "node $(node --version)   npm $(npm --version)"

# ── Env files ─────────────────────────────────────────────────────────────────
# Copy from the committed examples only when the real file is missing, so we
# never clobber existing local config.
ensure_env() {
  local target="$1" example="$2"
  if [ -f "$target" ]; then
    info "$(basename "$target") already exists — keeping it."
  elif [ -f "$example" ]; then
    cp "$example" "$target"
    warn "Created $(basename "$target") from $(basename "$example") — review its values."
  else
    warn "No $(basename "$example") found; skipping $(basename "$target")."
  fi
}

step "Setting up environment files"
ensure_env "$BACKEND/.env"        "$BACKEND/.env.example"
ensure_env "$FRONTEND/.env.local" "$FRONTEND/.env.local.example"

# ── Backend ───────────────────────────────────────────────────────────────────
step "Installing backend dependencies"
( cd "$BACKEND" && npm install )   # postinstall also runs `prisma generate`

step "Generating Prisma client"
( cd "$BACKEND" && npm run prisma:generate )

step "Applying database migrations"
( cd "$BACKEND" && npm run prisma:migrate )

step "Seeding the ADMIN user"
( cd "$BACKEND" && npm run prisma:seed )

# ── Frontend ──────────────────────────────────────────────────────────────────
step "Installing frontend dependencies"
( cd "$FRONTEND" && npm install )

# ── Done ──────────────────────────────────────────────────────────────────────
step "Setup complete 🎉"
cat <<EOF
${green}Next steps:${reset}
  Backend   : cd backend  && npm run start:dev   # http://localhost:3001/api
  Frontend  : cd frontend && npm run dev         # http://localhost:3000

  Admin login uses ADMIN_EMAIL / ADMIN_PASSWORD from backend/.env.
EOF
