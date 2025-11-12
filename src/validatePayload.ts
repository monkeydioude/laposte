import { ensureNonEmpty, isValidEmail } from "./utils";
import { getEventSpec } from "./config";


export function validatePayload(event: string, raw: any): Record<string, any> {
  const spec = getEventSpec(event);
  const p: Record<string, any> = { ...raw };

  for (const f of spec.required) {
    p[f] = ensureNonEmpty(p[f], f);
  }

  if ("email" in p) {
    p.email = ensureNonEmpty(p.email, "email").toLowerCase();
    if (!isValidEmail(p.email)) {
      throw new Error("Invalid email format");
    }
  }

  for (const f of (spec.optional ?? [])) {
    if (p[f] !== undefined && p[f] !== null) {
      p[f] = String(p[f]);
    }
  }

  return p;
}
