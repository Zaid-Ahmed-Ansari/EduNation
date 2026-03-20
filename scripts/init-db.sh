#!/bin/sh
set -eu

echo "[db-init] Waiting for Postgres..."
until pg_isready -h postgres -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1; do
  sleep 1
done

EXISTS=$(psql -h postgres -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -tAc "SELECT to_regclass('public.indicator_values')")

if [ "$EXISTS" = "indicator_values" ]; then
  echo "[db-init] Schema already present. Skipping initialization."
  exit 0
fi

echo "[db-init] Applying schema from /schema/SCHEMA.SQL"
psql -v ON_ERROR_STOP=1 -h postgres -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -f /schema/SCHEMA.SQL

echo "[db-init] Schema initialized successfully."
