import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect } from "vitest";

import { buildEmail } from "../src/buildEmail";
import { buildRegistry, splitPaths } from "../src/config";


function writeProduct(root: string, name: string, config: string, event: string, subject: string): string {
  const dir = path.join(root, name);
  const tpl = path.join(dir, "templates", event, "en");
  fs.mkdirSync(tpl, { recursive: true });
  fs.writeFileSync(path.join(tpl, "subject.txt"), subject);
  fs.writeFileSync(path.join(tpl, "text.txt"), "Hi {{firstname}}");
  const file = path.join(dir, "config.yml");
  fs.writeFileSync(file, config);
  return file;
}

function productConfig(event: string, from?: string): string {
  return [
    from ? `from: "${from}"` : "",
    "templates:",
    "  path: ./templates",
    "  langs: [en]",
    "events:",
    `  ${event}:`,
    "    required: [email]",
    `    template: ${event}`,
  ].join("\n");
}

function twoProducts() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "laposte-config-"));
  const spendbaker = writeProduct(root, "spendbaker", productConfig("new.user"), "new.user", "Welcome to Spendbaker");
  const kabane = writeProduct(
    root, "kabane", productConfig("kabane.welcome", "Kabane <hello@kabane.io>"), "kabane.welcome", "Welcome to Kabane",
  );
  return { spendbaker, kabane };
}

describe("splitPaths", () => {
  it("reads a comma-separated list and a single path", () => {
    expect(splitPaths("a/config.yml, b/config.yml,")).toEqual(["a/config.yml", "b/config.yml"]);
    expect(splitPaths("./config.yml")).toEqual(["./config.yml"]);
  });
});

describe("buildRegistry", () => {
  it("merges the events of several config files", () => {
    const { spendbaker, kabane } = twoProducts();
    const events = buildRegistry([spendbaker, kabane], "en");

    expect(Object.keys(events).sort()).toEqual(["kabane.welcome", "new.user"]);
    expect(events["new.user"]!.templatesDir).toBe(path.join(path.dirname(spendbaker), "templates"));
    expect(events["kabane.welcome"]!.templatesDir).toBe(path.join(path.dirname(kabane), "templates"));
  });

  it("keeps each config's sender", () => {
    const { spendbaker, kabane } = twoProducts();
    const events = buildRegistry([spendbaker, kabane], "en");

    expect(events["new.user"]!.from).toBeUndefined();
    expect(events["kabane.welcome"]!.from).toBe("Kabane <hello@kabane.io>");
  });

  it("fails on an event declared in two config files", () => {
    const { spendbaker } = twoProducts();
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "laposte-config-"));
    const other = writeProduct(root, "other", productConfig("new.user"), "new.user", "Hello");

    expect(() => buildRegistry([spendbaker, other], "en")).toThrow(/Event 'new.user' declared in both/);
  });

  it("fails with no config file", () => {
    expect(() => buildRegistry([], "en")).toThrow(/No config file/);
  });
});

describe("buildEmail", () => {
  it("renders each event from its own product's templates, with its sender", () => {
    const { spendbaker, kabane } = twoProducts();
    const events = buildRegistry([spendbaker, kabane], "en");
    const payload = { email: "a@b.io", firstname: "Syuzi" };

    const sb = buildEmail("new.user", events["new.user"]!, payload, "en");
    const kb = buildEmail("kabane.welcome", events["kabane.welcome"]!, payload, "en");

    expect(sb.subject).toBe("Welcome to Spendbaker");
    expect(sb.from).toBeUndefined();
    expect(kb.subject).toBe("Welcome to Kabane");
    expect(kb.text).toBe("Hi Syuzi");
    expect(kb.from).toBe("Kabane <hello@kabane.io>");
  });
});
