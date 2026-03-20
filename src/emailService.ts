import { env } from "./env";
import { buildEmail } from "./buildEmail";
import { sendEmailMock } from "./email";
import { validatePayload } from "./validatePayload";
import { insertHistory, tryLockForSending, markSendLogFailed } from "./db";
import { Message } from "./grpc/heyo_client";
import type { MailPayload } from "./types";


export type MailerFunc = (payload: MailPayload) => Promise<void>;

export async function processEmailTask(
  eventName: string,
  msg: Message,
  mailer: MailerFunc | null,
) {
  const t0 = Date.now();
  let rawData = msg.data;
  let email = "";
  let dedupId: string | undefined;
  let lang = env.LANG_DEFAULT;

  try {
    const raw = JSON.parse(rawData);
    const payload = validatePayload(eventName, raw);
    email = payload.email;
    dedupId = payload.dedup_id;
    lang = payload.lang;

    if (dedupId) {
      const hasLock = await tryLockForSending({ dedup_id: dedupId, email });
      if (!hasLock) {
        console.warn(`[dedup] Skip duplicate email: dedup_id=${dedupId} email=${email}`);
        return; // The email has already been sent, stop execution
      }
    }

    const built = buildEmail(eventName, payload, lang);
    if (env.DRY_RUN || !mailer) {
      await sendEmailMock(email, built.subject, built.text, built.html);
    } else {
      await mailer({ to: email, subject: built.subject, text: built.text, html: built.html });
    }
    console.log(
      `Message (${msg.clientName || msg.clientId || "unknown"}) < ${
        JSON.stringify({ ok: true, email })
    }`);
      await insertHistory({
        created_at: new Date().toISOString(),
        recipient: email,
        event: eventName,
        lang,
        subject: built.subject,
        ok: 1,
        payload_json: rawData,
      });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[handler error] ${eventName}:`, errorMessage);
    if (dedupId && email) {
      await markSendLogFailed({
        dedup_id: dedupId,
        email,
        error: errorMessage,
      });
      await insertHistory({
        created_at: new Date().toISOString(),
        recipient: email || "unknown",
        event: eventName,
        lang,
        ok: 0,
        error: errorMessage,
        payload_json: rawData,
      });
    }
  } finally {
    const dt = Date.now() - t0;
    if (dt > 2000) {
      console.warn(`[slow] handled ${eventName} in ${dt}ms`);
    }
  }
}
