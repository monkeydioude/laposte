import * as fs from "fs";
import * as path from "path";

import { renderTemplate } from "./utils";
import { getEventSpec, loadConfig } from "./config";


export function buildEmail(
  event: string,
  payload: Record<string, unknown>,
  lang: string
) {
  try {
    const cfg = loadConfig();
    const spec = getEventSpec(event);

    const langs = cfg.templates.langs;
    const root = cfg.templates.path;
    const effectiveLang = langs.includes(lang) ? lang : langs[0];

    const dir = path.resolve(process.cwd(), root, spec.template, effectiveLang);
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
    if (!subject || subject.trim().length === 0) {
      throw new Error("Email subject is empty");
    }

    const textRaw = fs.existsSync(textPath) ? fs.readFileSync(textPath, "utf8") : "";
    const text = renderTemplate(textRaw, dict);

    let html: string | undefined;
    if (fs.existsSync(htmlPath)) {
      const htmlRaw = fs.readFileSync(htmlPath, "utf8");
      html = renderTemplate(htmlRaw, { SUBJECT: subject, ...dict });
    }
    return { subject, text, html };
  } catch (e: any) {
    const msg = e?.message || String(e);
    throw new Error(`[buildEmail] ${msg}`);
  }
}
