-- migrations/init.sql
CREATE SCHEMA IF NOT EXISTS email_history;
SET search_path TO email_history;

CREATE TABLE schema_migrations (
    id SERIAL PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT now()
);

INSERT INTO schema_migrations DEFAULT VALUES;