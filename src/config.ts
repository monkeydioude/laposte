import fs from "fs";
import yaml from "js-yaml";
import path from "path";

import { env } from "./env";
import { EventSpec, ServiceConfig } from "./types.ts"


let cached: ServiceConfig | null = null;

export function loadConfig(): ServiceConfig {
  if (cached) {
    return cached;
  }

  const p = path.resolve(process.cwd(), env.CONFIG_PATH);
  if (!fs.existsSync(p)) {
    throw new Error(`Config file not found: ${p}`);
  }

  const raw = fs.readFileSync(p, "utf8");
  const data = yaml.load(raw) as any;

  if (!data || typeof data !== "object") {
    throw new Error("Invalid config: expected YAML object");
  }
  if (!data.templates || !data.templates.path) {
    throw new Error("Invalid config: missing 'templates.path'");
  }
  if (!Array.isArray(data.templates.langs) || data.templates.langs.length === 0) {
    data.templates.langs = [env.LANG_DEFAULT || "fr"];
  }
  if (!data.events || typeof data.events !== "object") {
    throw new Error("Invalid config: missing 'events'");
  }

  cached = data as ServiceConfig;
  return cached!;
}

export function getEventSpec(event: string): EventSpec {
  const cfg = loadConfig();
  const spec = cfg.events[event];
  if (!spec) {
    throw new Error(`Unsupported event '${event}'`);
  }
  return spec;
}
