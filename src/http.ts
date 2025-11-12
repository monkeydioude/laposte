import Fastify from "fastify";

import { loadConfig } from "./config";
import { queryHistory } from "./db";
import { HistoryRow } from "./types";


export function createHttpServer() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ ok: true }));

  app.get<{
    Querystring: { limit?: number; email?: string; event?: string };
    Reply: Array<{
      id?: number;
      created_at: string;
      recipient: string;
      event: string;
      lang: string;
      subject?: string;
      ok: boolean;
      error?: string;
      payload: Record<string, unknown>;
    }>;
  }>("/history", async (req, reply) => {
    const q: any = (req as any).query || {};
    const limit = q.limit ? Number(q.limit) : undefined;
    const email = q.email;
    const event = q.event;
    const rows: HistoryRow[] = await queryHistory({ limit, email, event });
    
    return rows.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      recipient: r.recipient,
      event: r.event,
      lang: r.lang,
      subject: r.subject,
      ok: !!r.ok,
      error: r.error,
      payload: JSON.parse(r.payload_json) as Record<string, unknown>,
    }));
  });

  app.get("/events", async () => {
    const cfg = loadConfig();
    return { events: Object.keys(cfg.events) };
  });

  return app;
}
