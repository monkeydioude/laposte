/** Payload of the email to send */
export interface MailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface BuiltEmail {
  subject: string;
  text?: string;
  html?: string;
}

export type TemplatesByLang = Record<string, string>;

export interface EventSpec {
  required: string[];
  optional?: string[];
  templates: TemplatesByLang;
}

export interface ServiceConfig {
  languages: string[];
  events: Record<string, EventSpec>;
}

export interface HistoryRow {
  id?: number;
  created_at: string;
  recipient: string;
  event: string;
  lang: string;
  subject?: string;
  ok: number;
  error?: string;
  payload_json: string;
}
