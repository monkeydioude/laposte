import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

import { env } from "./env";
import { HistoryRow } from "./types"

const dir = path.dirname(env.HISTORY_DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new Database(env.HISTORY_DB_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS email_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  recipient TEXT NOT NULL,
  event TEXT NOT NULL,
  lang TEXT NOT NULL,
  subject TEXT,
  ok INTEGER NOT NULL,
  error TEXT,
  payload_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_history_created ON email_history(created_at);
CREATE INDEX IF NOT EXISTS idx_history_recipient ON email_history(recipient);
CREATE INDEX IF NOT EXISTS idx_history_event ON email_history(event);
`);

const insertStmt = db.prepare(`
  INSERT INTO email_history (created_at, recipient, event, lang, subject, ok, error, payload_json)
  VALUES (@created_at, @recipient, @event, @lang, @subject, @ok, @error, @payload_json)
`);

export function insertHistory(row: HistoryRow) {
  insertStmt.run(row);
}

export function queryHistory(params: { limit?: number; email?: string; event?: string }): HistoryRow[] {
  const parts: string[] = [];
  const bind: any = {};
  if (params.email) {
    parts.push("recipient = @email"); bind.email = params.email;
  }
  if (params.event) {
    parts.push("event = @event"); bind.event = params.event;
  }
  const where = parts.length ? ("WHERE " + parts.join(" AND ")) : "";
  const limit = params.limit ?? 100;
  const sql = `SELECT * FROM email_history ${where} ORDER BY id DESC LIMIT ${limit}`;
  return db.prepare(sql).all(bind) as HistoryRow[];
}
