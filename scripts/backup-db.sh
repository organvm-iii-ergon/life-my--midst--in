#!/usr/bin/env bash
set -euo pipefail

# backup-db.sh — PostgreSQL backup with optional S3 upload
#
# Usage:
#   ./scripts/backup-db.sh                          # Local backup
#   S3_BUCKET=my-bucket ./scripts/backup-db.sh      # Local + S3
#   PGHOST=prod-db PGPORT=5432 ./scripts/backup-db.sh

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
DB_NAME="${PGDATABASE:-midst_prod}"
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Defaults for local development
export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5433}"
export PGUSER="${PGUSER:-inmidst}"

mkdir -p "$BACKUP_DIR"

echo "Backing up ${DB_NAME} from ${PGHOST}:${PGPORT}..."

pg_dump --no-owner --no-acl "$DB_NAME" | gzip > "$BACKUP_FILE"

FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup complete: ${BACKUP_FILE} (${FILE_SIZE})"

# Optional S3 upload
if [[ -n "${S3_BUCKET:-}" ]]; then
  S3_PATH="s3://${S3_BUCKET}/backups/${DB_NAME}/${DB_NAME}_${TIMESTAMP}.sql.gz"
  echo "Uploading to ${S3_PATH}..."
  aws s3 cp "$BACKUP_FILE" "$S3_PATH"
  echo "Upload complete."
fi

# Prune local backups older than 7 days
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +7 -delete 2>/dev/null || true
echo "Pruned backups older than 7 days."
