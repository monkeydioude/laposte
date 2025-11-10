export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function ensureNonEmpty(x: unknown, field: string): string {
  if (typeof x !== "string" || x.trim().length === 0) {
    throw new Error(`Field '${field}' must be a non-empty string`);
  }
  return x.trim();
}

export function renderTemplate(template: string, payload: Record<string, unknown>): string {
  let out = template;
  const entries = Object.entries(payload);
  for (const [key, value] of entries) {
    const re = new RegExp(`{{\s*${key.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\s*}}`, "gi");
    out = out.replace(re, String(value ?? ""));
  }
  return out;
}
