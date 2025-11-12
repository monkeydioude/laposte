import 'dotenv/config';


function bool(v: string | undefined, def: boolean): boolean {
  if (v === undefined) {
    return def;
  }
  return ["1","true","yes","y","on"].includes(v.toLowerCase());
}

export const env = {
  BROKER_ADDR: process.env.BROKER_ADDR ?? "[::]:8022",
  SERVICE_ID: process.env.SERVICE_ID ?? "email-service",
  SERVICE_NAME: process.env.SERVICE_NAME ?? "email-service",

  CONFIG_PATH: process.env.CONFIG_PATH ?? "./config.yml",

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  DRY_RUN: bool(process.env.DRY_RUN, true),
  HTTP_PORT: Number(process.env.HTTP_PORT ?? 8080),
  LANG_DEFAULT: process.env.LANG_DEFAULT ?? "fr",
  
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD,
  PGDATABASE: process.env.PGDATABASE,
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
