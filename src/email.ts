import nodemailer from "nodemailer";

import { env } from "./env";
import { type MailPayload, type SmtpConfig } from "./types";


export function validateMailPayload(p: MailPayload): void {
  if (!p.to || !p.to.trim()) {
    throw new Error("Missing 'to'");
  }
  if (!p.subject || !p.subject.trim()) {
    throw new Error("Missing 'subject'");
  }
  if ((!p.text || !p.text.trim()) && (!p.html || !p.html.trim())) {
    throw new Error("Either 'text' or 'html' must be provided");
  }
}

export function makeMailer(smtp: SmtpConfig) {
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: env.SMTP_USER!,
      pass: env.SMTP_PASS!,
    },
  });

  return async function sendMail(payload: MailPayload): Promise<void> {
    validateMailPayload(payload);
    const info = await transport.sendMail({
      from: smtp.from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });

    console.log("[MAIL] Sent:", info.messageId);
  };
}

export async function sendEmailMock(to: string, subject: string, text: string | undefined, html?: string) {
  if (!subject || !subject.trim()) {
    throw new Error("Email subject is empty (mock mode)");
  }
  console.log(
    `[email MOCK] to=${to} | subject="${subject}" | text="${(text ?? '').slice(0, 120)}"${html ? " | html=YES" : ""}`
  );
}
