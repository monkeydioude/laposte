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

export interface TemplatesRoot {
  path: string;
  langs: string[];
}

export interface EventSpec {
  required: string[];
  optional?: string[];
  /** folder name under templates path, e.g. 'new.user' */
  template: string;
}

export interface ServiceConfig {
  templates: TemplatesRoot;
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

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}
