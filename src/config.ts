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
  const data = yaml.load(raw) as ServiceConfig;
  if (!data || typeof data !== "object" || !data.events) {
    throw new Error("Invalid config: missing 'events'");
  }

  data.languages = data.languages ?? ["fr"];
  cached = data;
  return data;
}

export function getEventSpec(event: string): EventSpec {
  const cfg = loadConfig();
  const spec = cfg.events[event];
  if (!spec) {
    throw new Error(`Unsupported event '${event}'`);
  }
  return spec;
}
