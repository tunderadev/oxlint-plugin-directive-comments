import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import rule from "./no-unsupported-directive.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const HINTS: Record<string, string> = {
  eslint: "Configure the rule in your Oxlint config, or use an oxlint-disable comment.",
  "eslint-env": "Use the env option in your Oxlint config.",
  global: "Use the globals option in your Oxlint config.",
  globals: "Use the globals option in your Oxlint config.",
  exported: "Oxlint has no equivalent.",
};
const unsupported = (kind: string) => ({
  messageId: "unsupported",
  data: { kind, hint: HINTS[kind] },
});

tester.run("no-unsupported-directive", rule, {
  valid: [
    "/* eslint-disable */",
    "/* eslint-disable no-undef -- reason */",
    "// eslint-disable-next-line no-undef",
    "/* oxlint-disable */",
    "// oxlint-disable-line",
    // ESLint reads configuration comments from block comments only.
    "// eslint no-undef: off",
    "// eslint-env node",
    "// global $",
    "// globals a, b",
    "// exported foo",
    // Not directives.
    "/* eslintrc */",
    "/* eslint-plugin-foo */",
    "/* the eslint config lives in oxlint.config.ts */",
    "/* globalThis is fine */",
  ],
  invalid: [
    {
      code: "/* eslint no-undef: off */",
      errors: [{ ...unsupported("eslint"), line: 1, column: 2, endLine: 1, endColumn: 24 }],
    },
    { code: '/* eslint eqeqeq: "off", curly: "error" */', errors: [unsupported("eslint")] },
    { code: "/* eslint */", errors: [unsupported("eslint")] },
    { code: "/* eslint-env node */", errors: [unsupported("eslint-env")] },
    { code: "/* eslint-env */", errors: [unsupported("eslint-env")] },
    { code: "/* global $ */", errors: [unsupported("global")] },
    { code: "/* global $ -- jQuery */", errors: [unsupported("global")] },
    { code: "/* globals a, b */", errors: [unsupported("globals")] },
    { code: "/* exported foo */", errors: [unsupported("exported")] },
    {
      code: "const a = 1;\n/* global $ */\n/* eslint-env browser */",
      errors: [
        { ...unsupported("global"), line: 2 },
        { ...unsupported("eslint-env"), line: 3 },
      ],
    },
  ],
});
