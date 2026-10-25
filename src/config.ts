import fs from "fs";
import yaml from "js-yaml";
import path from "path";

import { env } from "./env";
import { type EventRegistry, type ResolvedEvent, type ServiceConfig } from "./types";


let cached: EventRegistry | null = null;

// splitPaths reads a comma-separated list of config files, e.g. "a/config.yml, b/config.yml".
export function splitPaths(value: string): string[] {
  return value.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
}

export function parseConfig(raw: string, file: string, langDefault: string): ServiceConfig {
  const data = yaml.load(raw) as any;

  if (!data || typeof data !== "object") {
    throw new Error(`Invalid config ${file}: expected YAML object`);
  }
  if (!data.templates || !data.templates.path) {
    throw new Error(`Invalid config ${file}: missing 'templates.path'`);
  }
  if (!Array.isArray(data.templates.langs) || data.templates.langs.length === 0) {
    data.templates.langs = [langDefault];
  }
  if (!data.events || typeof data.events !== "object") {
    throw new Error(`Invalid config ${file}: missing 'events'`);
  }
  if (data.from !== undefined && typeof data.from !== "string") {
    throw new Error(`Invalid config ${file}: 'from' must be a string`);
  }
  return data as ServiceConfig;
}

export function readConfigFile(file: string, langDefault: string): ServiceConfig {
  if (!fs.existsSync(file)) {
    throw new Error(`Config file not found: ${file}`);
  }
  return parseConfig(fs.readFileSync(file, "utf8"), file, langDefault);
}

// resolveEvents attaches to each event what it needs from its own config file:
// the templates folder (relative to that file), the langs and the sender.
export function resolveEvents(cfg: ServiceConfig, file: string): EventRegistry {
  const templatesDir = path.resolve(path.dirname(file), cfg.templates.path);
  const events: EventRegistry = {};
  for (const [name, spec] of Object.entries(cfg.events)) {
    events[name] = { ...spec, templatesDir, langs: cfg.templates.langs, from: cfg.from, configFile: file };
  }
  return events;
}

// mergeEvents fails on an event declared twice: Heyo routes by event name only,
// so two products sharing a name would both send an email.
export function mergeEvents(registries: EventRegistry[]): EventRegistry {
  const merged: EventRegistry = {};
  for (const registry of registries) {
    for (const [name, event] of Object.entries(registry)) {
      const existing = merged[name];
      if (existing) {
        throw new Error(`Event '${name}' declared in both ${existing.configFile} and ${event.configFile}`);
      }
      merged[name] = event;
    }
  }
  return merged;
}

export function buildRegistry(
  files: string[],
  langDefault: string,
  read: (file: string, langDefault: string) => ServiceConfig = readConfigFile,
): EventRegistry {
  if (files.length === 0) {
    throw new Error("No config file given: set CONFIG_PATHS");
  }
  const registries = files.map((f) => {
    const file = path.resolve(process.cwd(), f);
    return resolveEvents(read(file, langDefault), file);
  });
  return mergeEvents(registries);
}

export function loadEvents(): EventRegistry {
  if (!cached) {
    cached = buildRegistry(splitPaths(env.CONFIG_PATHS), env.LANG_DEFAULT || "fr");
  }
  return cached;
}

export function getEventSpec(event: string): ResolvedEvent {
  const spec = loadEvents()[event];
  if (!spec) {
    throw new Error(`Unsupported event '${event}'`);
  }
  return spec;
}
