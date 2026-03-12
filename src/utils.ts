import { env } from "./env";
import { loadConfig } from "./config";


export function supportedEvents(): string[] {
  const cfg = loadConfig();
  return Object.keys(cfg.events);
}

export function resolveLang(payload: Record<string, unknown>): string {
  const lang = payload.lang || payload.language;
  return typeof lang === "string" ? lang : env.LANG_DEFAULT;
}

export function isValidEmail(email: string | undefined): boolean {
  if (!email) {
    return false;
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function ensureNonEmpty(x: unknown, field: string): string {
  if (!x || typeof x !== "string" || x.trim().length === 0) {
    throw new Error(
      `Field '${field}' is required and must be a non-empty string`,
    );
  }
  return x.trim();
}

export function renderTemplate(template: string, dict: Record<string, unknown>): string {
  let out = template;
  const get = (key: string): unknown => {
    const kUpper = key.toUpperCase();
    const kLower = key.toLowerCase();
    return dict[key] ?? dict[kUpper] ?? dict[kLower];
  };
  out = out.replace(/\{\{#IF_([A-Z0-9_]+)\}\}([\s\S]*?)\{\{\/IF_\1\}\}/g, (_, key, content) => {
    const value = get(key);
    return value ? content : "";
  });
  out = out.replace(/\{\{\s*([A-Za-z0-9_\.\-]+)\s*\}\}/g, (_, key) => {
    const value = get(key);
    return String(value ?? "");
  });
  return out;
}
