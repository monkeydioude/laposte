import { env, requireForSending } from "./env";

import * as grpc from "@grpc/grpc-js";
import { BrokerClient, Message, Subscriber } from "./grpc/heyo_client";

import { buildEmail } from "./buildEmail";
import { makeMailer, sendEmailMock } from "./email";
import { validatePayload } from "./validatePayload";

import { v4 } from "uuid";
import { insertHistory } from "./db";
import { createHttpServer } from "./http";
import { resolveLang, supportedEvents } from "./utils";


const broker = new BrokerClient(env.BROKER_ADDR, grpc.credentials.createInsecure());

const missing = requireForSending();
const mailer = !env.DRY_RUN
  ? makeMailer({
      host: env.SMTP_HOST!,
      port: env.SMTP_PORT,
      user: env.SMTP_USER!,
      pass: env.SMTP_PASS!,
      from: env.SMTP_FROM!,
    })
  : null;

function handleStreamFor(eventName: string) {
  const sub: Subscriber = {
    event: eventName,
    clientId: v4(),
    name: env.SERVICE_NAME,
  };
  const stream = broker.subscription(sub);

  stream.on("data", async (m: Message) => {
    const t0 = Date.now();
    try {
      if (m.event !== eventName)
        return;

      console.log(
        `Message (${m.clientName || m.clientId || "unknown"}) > @${m.event} ${m.data}`
      );

      const raw = JSON.parse(m.data);
      const payload = validatePayload(eventName, raw);
      const lang = resolveLang(payload);
      const built = buildEmail(eventName, payload, lang);
      const to = String(payload.email || payload.to);
      if (!to) {
        throw new Error("Missing recipient email in payload");
      }

      if (env.DRY_RUN || !mailer) {
        await sendEmailMock(to, built.subject, built.text, built.html);
      } else {
        await mailer({ to, subject: built.subject, text: built.text, html: built.html });
      }

      console.log(
        `Message (${m.clientName || m.clientId || "unknown"}) < ${
          JSON.stringify({ ok: true, to })
      }`);
      await insertHistory({
        created_at: new Date().toISOString(),
        recipient: to,
        event: eventName,
        lang,
        subject: built.subject,
        ok: 1,
        error: undefined,
        payload_json: JSON.stringify(payload),
      });
    } catch (err: any) {
      console.error("[handler error]", err?.message || err);
      try {
        const raw = (() => {
          try {
            return JSON.parse(m.data);
          } catch {
            return {};
          }
        })();
        const payload = typeof raw === "object" && raw ? raw : {};
        const lang = resolveLang(payload as any);
        await insertHistory({
          created_at: new Date().toISOString(),
          recipient: String((payload as any).email || (payload as any).to || ""),
          event: eventName,
          lang,
          subject: "",
          ok: 0,
          error: String(err?.message || err),
          payload_json: JSON.stringify(payload),
        });
      } catch (error) {
        console.error(error);
      }
    } finally {
      const dt = Date.now() - t0;
      if (dt > 2000) {
        console.warn(`[slow] handled ${eventName} in ${dt}ms`);
      }
    }
  });

  stream.on("end", () => {
    console.warn(`[stream end] server closed the stream for ${eventName}`);
  });

  stream.on("error", (err: any) => {
    console.error(`Stream error for ${eventName}:`, err);
  });
}

async function main() {
  if (!env.DRY_RUN && missing.length) {
    throw new Error("Missing SMTP env: " + missing.join(", "));
  }

  const app = createHttpServer();
  await app.listen({ port: env.HTTP_PORT, host: "0.0.0.0" });
  console.log(`[email] DRY_RUN: ${env.DRY_RUN}${!env.DRY_RUN ? "\n!! EMAILS WILL BE SENT !!\n!! EMAILS WILL BE SENT !!\n!! EMAILS WILL BE SENT !!" : ""}`);
  console.log(`[http] listening on: ${env.HTTP_PORT}`);

  for (const evt of supportedEvents()) {
    try {
      handleStreamFor(evt);
      console.log(`[subscribe] listening for '${evt}' events`);
    } catch (e: any) {
      console.error(`[subscribe error] ${evt}:`, e?.message || e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
