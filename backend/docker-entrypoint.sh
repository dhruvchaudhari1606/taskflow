#!/bin/sh
# Container entrypoint for the TaskFlow backend.
#   RUN_MIGRATIONS=true  (default) apply pending TypeORM migrations before start
#   SEED_DEMO_DATA=true  (default false) load idempotent demo data after migrating
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] Running database migrations..."
  npm run --silent migration:run:dist
fi

if [ "${SEED_DEMO_DATA:-false}" = "true" ]; then
  echo "[entrypoint] Seeding demo data..."
  npm run --silent seed:run:dist
fi

echo "[entrypoint] Starting TaskFlow API on port ${APP_PORT:-4000}"
exec "$@"
