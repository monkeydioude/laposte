#!/bin/bash
set -e

echo "Waiting for database connection..."
until pg_isready; do
  sleep 2
done
echo "Database is ready."

# Check if schema_migrations table exists
TABLE_EXISTS=$(psql -tAc "SELECT to_regclass('email_history.schema_migrations');")

if [ -z "$TABLE_EXISTS" ]; then
  echo "No migration found, applying init.sql..."
  psql -f /migrations/init.sql
  echo "Creating migration tracking table..."
  psql -f /migrations/create_migrations_table.sql
  echo "Initial migration applied successfully."
else
  echo "Migration already applied, skipping."
fi
