import nodemailer from "nodemailer";

import { env, requireForSending } from "./env";
import { MailPayload } from "./new.user/types.ts";


export async function sendEmailMock(to: string, subject: string, text: string, html?: string) {
  console.log(
    `[email MOCK] to=${to} | subject="${subject}" | text="${text.slice(0, 120)}"${html ? " | html=YES" : ""}`
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

  if (env.DRY_RUN) {
    console.log(
      "[DRY_RUN] Would send e-mail:",
      { from: env.SMTP_FROM, ...payload }
    );
    try {
      await transport.verify();
      console.log("[DRY_RUN] SMTP verify: OK"); 
    }
    catch (e: any) {
      console.warn("[DRY_RUN] SMTP verify failed:", e?.message || e);
    }
    return;
  }

  const info = await transport.sendMail({
    from: env.SMTP_FROM!,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  console.log("[MAIL] Sent:", info.messageId);
}
