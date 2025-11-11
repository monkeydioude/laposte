import nodemailer from "nodemailer";

import { env, requireForSending } from "./env";
import { MailPayload } from "./types.ts";


export async function sendEmailMock(to: string, subject: string, text: string | undefined, html?: string) {
  console.log(
    `[email MOCK] to=${to} | subject="${subject}" | text="${(text ?? '').slice(0, 120)}"${html ? " | html=YES" : ""}`
  );
}

export async function sendMail(payload: MailPayload): Promise<void> {
  const missing = requireForSending();
  if (missing.length) {
    throw new Error("Missing SMTP env vars: " + missing.join(", "));
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST!,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER!,
      pass: env.SMTP_PASS!,
    },
  });

  const info = await transport.sendMail({
    from: env.SMTP_FROM!,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  console.log("[MAIL] Sent:", info.messageId);
}
