import { ensureNonEmpty, isValidEmail, resolveLang } from "./utils";
import { getEventSpec } from "./config";
import { type ValidatedPayload } from "./types";


export function validatePayload(event: string, raw: unknown): ValidatedPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid payload: must be a JSON object");
  }

  const spec = getEventSpec(event);
  const rawObj = raw as Record<string, unknown>;
  const p: Record<string, unknown> = { ...rawObj };
  for (const f of spec.required) {
    p[f] = ensureNonEmpty(p[f], f);
  }

  const emailRaw = p.email || p.to;
  const email = ensureNonEmpty(emailRaw, "email").toLowerCase();
  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  const dedup_id = p.dedup_id ? String(p.dedup_id).trim() : undefined;
  for (const f of (spec.optional ?? [])) {
    if (p[f] !== undefined && p[f] !== null) {
      p[f] = String(p[f]);
    }
  }
  return {
    ...p,
    email,
    dedup_id,
    lang: resolveLang(p)
  };
}
