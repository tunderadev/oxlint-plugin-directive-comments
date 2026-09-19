import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import { withPrefixes } from "../testing/prefixes.ts";
import rule from "./no-aggregating-enable.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const aggregating = (count: number) => ({
  messageId: "aggregatingEnable",
  data: { kind: "eslint-enable", disable: "eslint-disable", count: String(count) },
});

tester.run("no-aggregating-enable", rule, {
  valid: withPrefixes([
    "/*eslint-disable no-redeclare*/\n/*eslint-enable no-redeclare*/",
    "/*eslint-disable no-redeclare*/\n/*eslint-enable no-shadow*/",
    "/*eslint-disable no-redeclare, no-shadow*/\n/*eslint-enable*/",
    "/*eslint-disable no-redeclare, no-shadow*/\n/*eslint-enable no-redeclare, no-shadow*/",
    "/*eslint-disable no-redeclare, no-shadow*/\n/*eslint-enable no-redeclare*/\n/*eslint-enable no-shadow*/",
    // Line areas and block areas are tracked apart.
    "/*eslint-disable no-redeclare*/\nfoo(); // eslint-disable-line no-shadow\n/*eslint-enable*/",
  ]),
  invalid: withPrefixes([
    {
      code: "/*eslint-disable no-redeclare*/\n/*eslint-disable no-shadow*/\n/*eslint-enable*/",
      errors: [{ ...aggregating(2), line: 3, column: 2, endLine: 3, endColumn: 15 }],
    },
    {
      code: "/*eslint-disable no-redeclare*/\n/*eslint-disable no-shadow*/\n/*eslint-disable no-undef*/\n/*eslint-enable*/",
      errors: [aggregating(3)],
    },
    {
      code: "/*eslint-disable no-redeclare*/\n/*eslint-disable no-shadow*/\n/*eslint-enable no-redeclare, no-shadow*/",
      errors: [aggregating(2)],
    },
    {
      code: "/*eslint-disable no-redeclare*/\n/*eslint-disable no-shadow*/\n/*eslint-enable -- description*/",
      errors: [aggregating(2)],
    },
    {
      code: "// eslint-disable no-redeclare\n// eslint-disable no-shadow\n// eslint-enable",
      errors: [{ ...aggregating(2), line: 3, column: 2, endLine: 3, endColumn: 16 }],
    },
  ]),
});
