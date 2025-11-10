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
