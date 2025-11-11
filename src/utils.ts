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
    const value = dict[key] ?? dict[key.toUpperCase()] ?? "";
    return String(value);
  });
}
