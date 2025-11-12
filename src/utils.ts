import { env } from "./env";
import { loadConfig } from "./config";


export function supportedEvents(): string[] {
  const cfg = loadConfig();
  return Object.keys(cfg.events);
}

export function resolveLang(payload: Record<string, any>): string {
  return (payload.lang || payload.language || env.LANG_DEFAULT || "fr");
}

export function isValidEmail(email: string | undefined): boolean {
  if (!email) {
    return false;
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function ensureNonEmpty<T extends string | undefined>(x: T, field: string): string {
  if (!x || String(x).trim().length === 0) {
    throw new Error(`Field '${field}' is required`);
  }
  return String(x).trim();
}

export function renderTemplate(template: string, dict: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([A-Za-z0-9_\.\-]+)\s*\}\}/g, (_, key) => {
    const value = (dict as any)[key] ?? (dict as any)[String(key).toUpperCase()] ?? "";
    return String(value);
  });
}
