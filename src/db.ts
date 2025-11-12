import { Pool } from "pg";

import { env } from "./env";
import { type HistoryRow } from "./types";

function buildPool(): Pool {
  return new Pool({
    host: env.PGHOST || "localhost",
    port: env.PGPORT || 5432,
    user: env.PGUSER || "postgres",
    password: env.PGPASSWORD || "",
    database: env.PGDATABASE || "postgres",
  });
}

export const pool = buildPool();

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
