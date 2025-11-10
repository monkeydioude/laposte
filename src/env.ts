import 'dotenv/config';


function bool(v: string | undefined, def: boolean): boolean {
  if (v === undefined) {
    return def;
  }
  return ["1","true","yes","y","on"].includes(v.toLowerCase());
}

function splitList(v: string | undefined, fallback: string[]): string[] {
  if (!v || v.trim().length === 0) {
    return fallback;
  }
  return v.split(",").map(s => s.trim()).filter(Boolean);
}

export const env = {
  BROKER_ADDR: process.env.BROKER_ADDR ?? "[::]:8022",
  // EVENT_NAME: (process.env.EVENT_NAME ?? "new.user")
  EVENTS: splitList( // как это прочитать из файла конфигурации ?
    process.env.EVENTS, 
    process.env.EVENT_NAME ? [process.env.EVENT_NAME] : ["new.user"]
  ),
  SERVICE_ID: process.env.SERVICE_ID ?? "email-service",
  SERVICE_NAME: process.env.SERVICE_NAME ?? "email-service",

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  DRY_RUN: bool(process.env.DRY_RUN, true),
};

export function requireForSending(): string[] {
  const missing: string[] = [];
  if (!env.SMTP_HOST)
    missing.push('SMTP_HOST');
  if (!env.SMTP_PORT)
    missing.push('SMTP_PORT');
  if (!env.SMTP_USER)
    missing.push('SMTP_USER');
  if (!env.SMTP_PASS)
    missing.push('SMTP_PASS');
  if (!env.SMTP_FROM)
    missing.push('SMTP_FROM');
  return missing;
}
