#!/usr/bin/env bash
# Wipes the local Postgres volume and restarts the stack, so the backend re-applies
# migrations and reseeds demo data from scratch. Local development convenience only.
set -euo pipefail

cd "$(dirname "$0")/../.."

docker compose down
docker volume rm edutrack_pgdata 2>/dev/null || true
docker compose up -d --build

echo "Database reset. Demo accounts: admin@edutrack.local / Admin@123 (see README for the full list)."
