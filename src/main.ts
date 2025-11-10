import { env } from "./env";
import * as fs from "fs";
import * as grpc from "@grpc/grpc-js";
import { BrokerClient, Message, Subscriber } from "./grpc/heyo_client.ts";

import { MessageData } from "./new.user/types.ts";
import { sendMail, sendEmailMock } from "./email.ts";
import { isValidEmail, ensureNonEmpty } from "./utils.ts"
import { buildWelcomeEmail } from "./templates/welcome.ts";


const broker = new BrokerClient(env.BROKER_ADDR, grpc.credentials.createInsecure());

const sub: Subscriber = {
  event: env.EVENT_NAME,
  clientId: env.SERVICE_ID,
  name: env.SERVICE_NAME,
};

const stream = broker.subscription(sub);

// function buildEmail(event: string, payload: Record<string, any>): string {
//   // a verifier
//   const buf = fs.readFileSync(`${event}/template.html`);
//   let html = buf.toString();
//   for (const [key, value] of Object.entries(payload)) {
//     // email => {{EMAIL}} : value
//     html = html.replaceAll(`{{${key.toLocaleUpperCase()}}}`, value);
//   }
// }

stream.on("data", async (m: Message) => {
  try {
    if (m.event !== env.EVENT_NAME)
      return;

    console.log(
      `Message (${m.clientName || m.clientId || "unknown"}) > ` +
      `@${m.event} ${m.data}`
    );

    const payload: MessageData = JSON.parse(m.data);

    const email = ensureNonEmpty(payload.email, "email").toLowerCase();
    const firstname = ensureNonEmpty(payload.firstname, "firstname");
    const lastname = ensureNonEmpty(payload.lastname, "lastname");

    if (!isValidEmail(email)) {
      throw new Error("Invalid email format");
    }

    const { subject, text, html } = buildWelcomeEmail(firstname, lastname, email);
    // buildEmail("new.event", payload)

    if (env.DRY_RUN) {
      await sendEmailMock(email, subject, text, html);
    } else {
      await sendMail({ to: email, subject, text, html });
    }
  
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
