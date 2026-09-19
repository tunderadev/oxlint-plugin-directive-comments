import { defineConfig } from "oxlint";
import { describe, expect, it } from "vite-plus/test";
import plugin, { configs, name, rules } from "./index.ts";

describe("plugin", () => {
  it("carries configs on the default export", () => {
    expect(plugin.configs).toBe(configs);
  });

  it("extends into oxlint.config.ts the way the README shows", () => {
    // Also a type check: the rule severities must stay literal for OxlintConfig.
    const config = defineConfig({ extends: [plugin.configs.recommended] });
    expect(config.extends?.[0]?.jsPlugins).toEqual(["oxlint-plugin-directive-comments"]);
  });

  it("only recommends rules that exist", () => {
    for (const id of Object.keys(configs.recommended.rules)) {
      expect(Object.keys(rules)).toContain(id.replace(`${name}/`, ""));
    }
  });
});
