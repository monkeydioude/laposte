import 'dotenv/config';

export const env = {
  BROKER_ADDR: process.env.BROKER_ADDR ?? "localhost:8022",
  EVENT_NAME: (process.env.EVENT_NAME ?? "new.user"),
  SERVICE_ID: process.env.SERVICE_ID ?? "email-service",
  SERVICE_NAME: process.env.SERVICE_NAME ?? "email-service",

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PASS: process.env.SMTP_PASS,
  // SMTP_PORT: num(process.env.SMTP_PORT, 587), // ??
  // SMTP_USER: process.env.SMTP_USER,
  // SMTP_FROM: process.env.SMTP_FROM,
  // DRY_RUN: bool(process.env.DRY_RUN, true), // ??
};
