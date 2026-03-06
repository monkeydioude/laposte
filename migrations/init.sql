CREATE SCHEMA IF NOT EXISTS spendbaker;
SET search_path TO spendbaker;
CREATE EXTENSION IF NOT EXISTS "pg_uuidv7" WITH SCHEMA spendbaker;
CREATE SCHEMA IF NOT EXISTS email_history;
SET search_path TO email_history;

CREATE TABLE IF NOT EXISTS email_history (
  id SERIAL PRIMARY KEY,
  created_at TEXT NOT NULL,
  recipient TEXT NOT NULL,
  event TEXT NOT NULL,
  lang TEXT NOT NULL,
  subject TEXT,
  ok INTEGER NOT NULL,
  error TEXT,
  payload_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_send_log (
  id BIGSERIAL PRIMARY KEY,
  dedup_id VARCHAR(127) NOT NULL,
  email VARCHAR(127) NOT NULL,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS email_send_log_dedup_email_success_uniq
  ON email_send_log (dedup_id, email)
  WHERE error IS NULL;
