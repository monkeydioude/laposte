import * as grpc from "@grpc/grpc-js";
import { v4 } from "uuid";
import { getPool } from "./db";
import { makeMailer } from "./email";
import { processEmailTask } from "./emailService";
import { env, requireForSending } from "./env";
import { BrokerClient, Message, Subscriber } from "./grpc/heyo_client";
import { createHttpServer } from "./http";
import { supportedEvents } from "./utils";


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

  stream.on("data", (msg: Message) => {
    if (msg.event !== eventName)
      return;
    console.log(
      `Message (${msg.clientName || msg.clientId || "unknown"}) > @${msg.event} ${msg.data}`
    );
    processEmailTask(eventName, msg, mailer).catch((err) => {
      console.error(`[processEmailTask fatal error] ${eventName}:`, err);
    });
  });
  stream.on("end", () => {
    console.warn(`[stream end] server closed the stream for ${eventName}`);
  });
  stream.on("error", (err: unknown) => {
    console.error(`Stream error for ${eventName}:`, err);
    process.exit(1);
  });
}

async function main() {
  await getPool();
  if (!env.DRY_RUN && missing.length) {
    throw new Error("Missing SMTP env: " + missing.join(", "));
  }

  const app = createHttpServer();
  await app.listen({ port: env.HTTP_PORT, host: "0.0.0.0", path: "/laposte" });
  console.log(`[email] DRY_RUN: ${env.DRY_RUN}${
    !env.DRY_RUN ? "\n!! EMAILS WILL BE SENT !!\n!! EMAILS WILL BE SENT !!\n!! EMAILS WILL BE SENT !!" : ""
  }`);
  console.log(`[http] listening on: ${env.HTTP_PORT}`);

  for (const evt of supportedEvents()) {
    try {
      handleStreamFor(evt);
      console.log(`[subscribe] listening for '${evt}' events`);
    } catch (e: unknown) {
      console.error(
        `[subscribe error] ${evt}:`,
        e instanceof Error ? e.message : String(e),
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
