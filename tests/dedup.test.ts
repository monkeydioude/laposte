import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Pool } from "pg";

const TEST_DB = {
  host: process.env.PGHOST ?? "localhost",
  port: Number(process.env.PGPORT ?? "55432"),
  user: process.env.PGUSER ?? "test",
  password: process.env.PGPASSWORD ?? "test",
  database: process.env.PGDATABASE ?? "test",
};

const PG_UNIQUE_VIOLATION = "23505";

let pool: Pool;

async function resetSchema() {
  await pool.query(`DROP SCHEMA IF EXISTS email_history CASCADE;`);
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS email_history;
    SET search_path TO email_history;

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
  `);
}

async function tryLockForSendingDirect(dedupId: string, email: string): Promise<boolean> {
  try {
    await pool.query(
      `INSERT INTO email_history.email_send_log(dedup_id, email, error)
       VALUES ($1, $2, NULL)`,
      [dedupId, email]
    );
    return true;
  } catch (e: any) {
    if (e?.code === PG_UNIQUE_VIOLATION) return false;
    throw e;
  }
}

async function markSendLogFailedDirect(
  dedupId: string,
  email: string,
  error: string
): Promise<void> {
  await pool.query(
    `UPDATE email_history.email_send_log
     SET error = $3
     WHERE dedup_id = $1
       AND email = $2
       AND error IS NULL`,
    [dedupId, email, error]
  );
}

// async function hasSuccessfulLockDirect(dedupId: string, email: string): Promise<boolean> {
//   const res = await pool.query(
//     `SELECT 1
//      FROM email_history.email_send_log
//      WHERE dedup_id = $1
//        AND email = $2
//        AND error IS NULL
//      LIMIT 1`,
//     [dedupId, email]
//   );
//   return res.rows.length > 0;
// }

describe("email dedup by dedup_id", () => {
  beforeAll(async () => {
    pool = new Pool(TEST_DB);
    await pool.query("SELECT 1");
    await resetSchema();
  });

  afterAll(async () => {
    await pool.end();
  });

  it("allows first lock", async () => {
    const dedupId = "welcome-1";
    const email = "a@b.com";

    const locked = await tryLockForSendingDirect(dedupId, email);

    expect(locked).toBe(true);
  });

  it("does not allow second successful lock for same dedup_id and email", async () => {
    const dedupId = "invoice-1";
    const email = "x@y.com";

    const first = await tryLockForSendingDirect(dedupId, email);
    const second = await tryLockForSendingDirect(dedupId, email);

    expect(first).toBe(true);
    expect(second).toBe(false);
  });

  it("allows retry after failure", async () => {
    const dedupId = "reset-password-1";
    const email = "c@d.com";

    const first = await tryLockForSendingDirect(dedupId, email);
    expect(first).toBe(true);

    await markSendLogFailedDirect(dedupId, email, "smtp_fail");

    const retry = await tryLockForSendingDirect(dedupId, email);
    expect(retry).toBe(true);
  });

  it("allows same email for different dedup_id values", async () => {
    const email = "same@y.com";

    const r1 = await tryLockForSendingDirect("reset-password-1", email);
    const r2 = await tryLockForSendingDirect("reset-password-2", email);

    expect(r1).toBe(true);
    expect(r2).toBe(true);
  });

  it("allows only one concurrent lock for same dedup_id and email", async () => {
    const dedupId = "race-1";
    const email = "race@test.com";

    const [r1, r2] = await Promise.all([
      tryLockForSendingDirect(dedupId, email),
      tryLockForSendingDirect(dedupId, email),
    ]);

    const successCount = [r1, r2].filter(Boolean).length;
    const failCount = [r1, r2].filter((v) => !v).length;

    expect(successCount).toBe(1);
    expect(failCount).toBe(1);
  });
});
