#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Spin up the local development stack (MariaDB + NestJS API with hot-reload).
#
# Usage:
#   ./scripts/dev.sh            # build (if needed) and start, streaming logs
#   ./scripts/dev.sh up         # same as above
#   ./scripts/dev.sh build      # force a rebuild of the backend image
#   ./scripts/dev.sh down       # stop and remove containers
#   ./scripts/dev.sh clean      # stop and ALSO delete the database volume
#   ./scripts/dev.sh logs       # tail logs
#   ./scripts/dev.sh <args...>  # passthrough to `docker compose`
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# Run from the backend directory regardless of where the script is invoked.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

COMPOSE_FILE="docker-compose.dev.yml"
ENV_FILE="docker.env"

# Prefer the v2 plugin (`docker compose`); fall back to legacy `docker-compose`.
if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "error: docker compose is not installed or not on PATH" >&2
  exit 1
fi

# Use the Docker dev env file when present (drives compose variable
# substitution); otherwise compose falls back to a local `.env` / its defaults.
ENV_ARGS=()
if [[ -f "$ENV_FILE" ]]; then
  ENV_ARGS=(--env-file "$ENV_FILE")
else
  echo "warning: $ENV_FILE not found — copy it with: cp docker.env.example $ENV_FILE" >&2
fi

compose() { "${COMPOSE[@]}" "${ENV_ARGS[@]:+${ENV_ARGS[@]}}" -f "$COMPOSE_FILE" "$@"; }

cmd="${1:-up}"
case "$cmd" in
  up|"")
    compose up --build
    ;;
  build)
    compose build --no-cache
    ;;
  down)
    compose down
    ;;
  clean)
    compose down --volumes
    ;;
  logs)
    compose logs -f
    ;;
  *)
    compose "$@"
    ;;
esac
