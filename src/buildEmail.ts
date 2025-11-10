import * as fs from "fs";
import * as path from "path";
import { renderTemplate } from "./utils";
import { BuiltEmail } from "./types.ts";


export function buildEmail<T extends object>(
  event: string,
  payload: T,
  templatesRoot = path.resolve(process.cwd(), "src", "templates")
): BuiltEmail {
  const dir = path.join(templatesRoot, event);
  const subjectPath = path.join(dir, "subject.txt");
  const textPath = path.join(dir, "text.txt");
  const htmlPath = path.join(dir, "template.html");

  if (!fs.existsSync(dir)) {
    throw new Error(`Templates for event '${event}' not found at ${dir}`);
  }

  const dict = payload as unknown as Record<string, unknown>;

  const subjectRaw = fs.existsSync(subjectPath) ? fs.readFileSync(subjectPath, "utf8") : "";
  const subject = renderTemplate(subjectRaw.trim(), dict);

  const textRaw = fs.existsSync(textPath) ? fs.readFileSync(textPath, "utf8") : "";
  const text = renderTemplate(textRaw, dict);

  let html: string | undefined;
  if (fs.existsSync(htmlPath)) {
    const htmlRaw = fs.readFileSync(htmlPath, "utf8");
    html = renderTemplate(htmlRaw, { SUBJECT: subject, ...dict });
  }

  return { subject, text, html };
}