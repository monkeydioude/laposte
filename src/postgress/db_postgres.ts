import { Pool } from "pg";

import { env } from "./env";
import { HistoryRow } from "./types";

function buildPool(): Pool {
  if (env.POSTGRES_URL) {
    return new Pool({ connectionString: env.POSTGRES_URL });
  }
  return new Pool({
    host: env.PGHOST || "localhost",
    port: env.PGPORT || 5432,
    user: env.PGUSER || "postgres",
    password: env.PGPASSWORD || "",
    database: env.PGDATABASE || "postgres",
  });
}

export const pool = buildPool();

async function init() {
  await pool.query(`
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
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_history_created ON email_history(created_at)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_history_recipient ON email_history(recipient)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_history_event ON email_history(event)`);
}

init().catch((e) => {
  console.error("[db init] failed:", e);
  process.exit(1);
});

export async function insertHistory(row: HistoryRow) {
  await pool.query(
    `INSERT INTO email_history
      (created_at, recipient, event, lang, subject, ok, error, payload_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      row.created_at,
      row.recipient,
      row.event,
      row.lang,
      row.subject ?? null,
      row.ok,
      row.error ?? null,
      row.payload_json,
    ]
  );
}

export async function queryHistory(params: { limit?: number; email?: string; event?: string }): Promise<HistoryRow[]> {
  const where: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (params.email) {
    where.push(`recipient = $${idx++}`);
    values.push(params.email);
  }
  if (params.event) {
    where.push(`event = $${idx++}`);
    values.push(params.event);
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const limit = params.limit ?? 100;

  const sql = `SELECT * FROM email_history ${clause} ORDER BY id DESC LIMIT ${limit}`;
  const res = await pool.query(sql, values);
  return res.rows as HistoryRow[];
}
