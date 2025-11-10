import { env } from "./env";
import * as grpc from "@grpc/grpc-js";
import { BrokerClient, Message, Subscriber } from "./grpc/heyo_client.ts";
import { MessageData } from "./new.user/types.ts";
import { sendEmailMock } from "./email/email.ts";

const broker = new BrokerClient(env.BROKER_ADDR, grpc.credentials.createInsecure());

const sub: Subscriber = {
  event: env.EVENT_NAME,
  clientId: env.SERVICE_ID,
  name: env.SERVICE_NAME,
};

const stream = broker.subscription(sub);

stream.on("data", async (m: Message) => {
  try {
    if (m.event !== env.EVENT_NAME)
      return;

    console.log(
      `Message (${m.clientName || m.clientId || "unknown"}) > ` +
      `@${m.event} ${m.data}`
    );

    const payload: MessageData = JSON.parse(m.data);

    const subject = `Welcome, ${payload.firstname}!`;
    const text =
      `Salut ${payload.firstname} ${payload.lastname}!\n` +
      `Ton email: ${payload.email}\n` +
      `Bienvenue`;

    await sendEmailMock(payload.email, subject, text);

    console.log(
      `Message (${m.clientName || m.clientId || "unknown"}) < ${
        JSON.stringify({ ok: true, to: payload.email })
      }`
    );
  } catch (err: any) {
    console.error("[handler error]", err?.message || err);
  }
});

stream.on("end", () => {
  console.warn("[stream end] server closed the stream");
});

stream.on("error", (err) => {
  console.error("Stream error:", err);
});
