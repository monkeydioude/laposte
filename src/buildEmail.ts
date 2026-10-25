import * as fs from "fs";
import * as path from "path";

import { type ResolvedEvent } from "./types";
import { renderTemplate } from "./utils";


export function buildEmail(
  event: string,
  spec: ResolvedEvent,
  payload: Record<string, unknown>,
  lang: string
) {
  try {
    const langs = spec.langs;
    const effectiveLang = langs.includes(lang) ? lang : langs[0];

    const dir = path.join(spec.templatesDir, spec.template, effectiveLang!);
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
    return { subject, text, html, from: spec.from };
  } catch (e: any) {
    const msg = e?.message || String(e);
    throw new Error(`[buildEmail] ${msg}`);
  }
}
