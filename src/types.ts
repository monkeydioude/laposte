export interface MailPayload {
  to: string;
  from?: string;
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
  template: string;
}

export interface ServiceConfig {
  templates: TemplatesRoot;
  // from is this config's sender, e.g. "Kabane <hello@kabane.io>"; SMTP_FROM when unset.
  from?: string;
  events: Record<string, EventSpec>;
}

// ResolvedEvent is an event with what it needs from the config file declaring it.
export interface ResolvedEvent extends EventSpec {
  templatesDir: string;
  langs: string[];
  from?: string;
  configFile: string;
}

export type EventRegistry = Record<string, ResolvedEvent>;

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

export interface ValidatedPayload {
  email: string;
  dedup_id?: string;
  lang: string;
  [key: string]: unknown;
}
