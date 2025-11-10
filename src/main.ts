import { env } from "./env";

import * as grpc from "@grpc/grpc-js";
import { BrokerClient, Message, Subscriber } from "./grpc/heyo_client.ts";

import { EventMap} from "./types.ts";
import { sendMail, sendEmailMock } from "./email.ts";
import { buildEmail } from "./buildEmail.ts"
import { validatePayload } from "./validatePayload.ts";


const broker = new BrokerClient(env.BROKER_ADDR, grpc.credentials.createInsecure());

function handleStreamFor(eventName: keyof EventMap) {
  const sub: Subscriber = {
    event: eventName,
    clientId: env.SERVICE_ID,
    name: env.SERVICE_NAME,
  };
  const stream = broker.subscription(sub);

  stream.on("data", async (m: Message) => {
    try {
      if (m.event !== eventName)
        return;

      console.log(
        `Message (${m.clientName || m.clientId || "unknown"}) > @${m.event} ${m.data}`
      );

      const raw = JSON.parse(m.data);
      const payload = validatePayload(eventName, raw);

      const built = buildEmail(eventName, payload);
      const to = (payload as any).email as string;

      if (env.DRY_RUN) {
        await sendEmailMock(to, built.subject, built.text, built.html);
      } else {
        await sendMail({ to, subject: built.subject, text: built.text, html: built.html });
      }

      console.log(
        `Message (${m.clientName || m.clientId || "unknown"}) < ${
          JSON.stringify({ ok: true, to })
      }`
    );
    } catch (err: any) {
      console.error("[handler error]", err?.message || err);
    }
  });

  stream.on("end", () => {
    console.warn(`[stream end] server closed the stream for ${eventName}`);
  });

  stream.on("error", (err: any) => {
    console.error(`Stream error for ${eventName}:`, err);
  });
}

(env.EVENTS as (keyof EventMap)[]).forEach((evt) => {
  try {
    handleStreamFor(evt);
    console.log(`[subscribe] listening for '${evt}' ...`);
  } catch (e: any) {
    console.error(`[subscribe error] ${evt}:`, e?.message || e);
  }
});
