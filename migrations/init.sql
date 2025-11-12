-- migrations/init.sql
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