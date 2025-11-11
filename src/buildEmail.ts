import * as fs from "fs";
import * as path from "path";

import { renderTemplate } from "./utils";
import { getEventSpec, loadConfig } from "./config";


export function buildEmail(
  event: string,
  payload: Record<string, unknown>,
  lang: string
) {
  const cfg = loadConfig();
  const spec = getEventSpec(event);
  const tplRoot = spec.templates[lang] ?? spec.templates[cfg.languages[0]];
  if (!tplRoot) {
    throw new Error(`No templates configured for event '${event}' and language '${lang}'`);
  }

  const dir = path.resolve(process.cwd(), tplRoot);
  const subjectPath = path.join(dir, "subject.txt");
  const textPath = path.join(dir, "text.txt");
  const htmlPath = path.join(dir, "template.html");

  if (!fs.existsSync(dir)) {
    throw new Error(`Templates for event '${event}' not found at ${dir}`);
  }

  const dict: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    dict[key] = value;
    dict[key.toUpperCase()] = value;
  }

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
