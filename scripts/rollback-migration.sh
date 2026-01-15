#!/bin/bash
set -e

MIGRATION=$1

if [ -z "$MIGRATION" ]; then
  echo "Usage: ./scripts/rollback-migration.sh <migration_name_or_version>"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not set"
  exit 1
fi

echo "Rolling back migration: $MIGRATION"
echo "Database: $DATABASE_URL"
echo ""
echo "⚠️  This will modify the database. Ensure you have a backup!"
echo "Press Ctrl+C to cancel..."
sleep 5

if [ "$MIGRATION" = "latest" ]; then
  MIGRATION=$(psql "$DATABASE_URL" -tc "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1" | tr -d ' ')
  echo "Latest migration: $MIGRATION"
fi

ROLLBACK_FILE="apps/api/migrations/rollback/${MIGRATION}.sql"

if [ ! -f "$ROLLBACK_FILE" ]; then
  echo "Error: Rollback script not found: $ROLLBACK_FILE"
  exit 1
fi

echo "Executing rollback: $ROLLBACK_FILE"
psql "$DATABASE_URL" -f "$ROLLBACK_FILE"

echo "Removing from migration tracking..."
psql "$DATABASE_URL" -c "DELETE FROM schema_migrations WHERE version = '$MIGRATION';"

echo "✅ Rollback complete"
psql "$DATABASE_URL" -c "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 5;"
