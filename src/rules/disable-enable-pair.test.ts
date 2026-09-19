import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import { withPrefixes } from "../testing/prefixes.ts";
import rule from "./disable-enable-pair.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const missingPair = (kind: string) => ({
  messageId: "missingPair",
  data: { kind, enable: "eslint-enable", ruleId: "" },
});
const missingRulePair = (kind: string, ruleId: string) => ({
  messageId: "missingRulePair",
  data: { kind, enable: "eslint-enable", ruleId },
});

tester.run("disable-enable-pair", rule, {
  valid: [
    ...withPrefixes([
      "\n/*eslint-disable*/\n/*eslint-enable*/\n",
      "\n/*eslint-disable no-undef,no-unused-vars*/\n/*eslint-enable no-undef,no-unused-vars*/\n",
      "\n/*eslint-disable no-undef,no-unused-vars*/\n/*eslint-enable*/\n",
      "//eslint-disable-line",
      "//eslint-disable-next-line",
      "/*eslint-disable-line*/",
      "/*eslint-disable-next-line*/",
      "function foo() {\n    /*eslint-disable*/\n    /*eslint-enable*/\n}\n",
      "\n/*eslint-disable no-undef*/\n/*eslint-disable no-unused-vars*/\n/*eslint-enable*/\n/*eslint-enable*/\n",
      "\n/*eslint-disable no-undef -- description*/\n/*eslint-enable no-undef*/\n",
      "\n/*eslint-disable no-undef,no-unused-vars -- description*/\n/*eslint-enable no-undef,no-unused-vars*/\n",
      // Oxlint honours line comments for disable and enable.
      "// eslint-disable no-undef\nconst a = 1;\n// eslint-enable no-undef",
      {
        code: "\nconsole.log('This code does not even have any special comments')\n",
        options: [{ allowWholeFile: true }],
      },
      { code: "\n/*eslint-disable*/\n", options: [{ allowWholeFile: true }] },
      {
        code: "\n/*eslint-disable no-undef*/\n/*eslint-disable no-unused-vars*/\n/*eslint-enable*/\n",
        options: [{ allowWholeFile: true }],
      },
      {
        code: "\n\n/**\n * @file Comments and blank lines before a whole-file disable are fine.\n */\n\n/*eslint-disable*/\n",
        options: [{ allowWholeFile: true }],
      },
      {
        code: "\n/*eslint-disable no-unused-vars, no-undef */\nvar foo = 1\n",
        options: [{ allowWholeFile: true }],
      },
    ]),
    "/*eslint no-undef: off */",
  ],
  invalid: withPrefixes([
    {
      code: "\n/*eslint-disable*/\n",
      errors: [{ ...missingPair("eslint-disable"), line: 2, column: 2, endLine: 2, endColumn: 16 }],
    },
    {
      code: "\n/*eslint-disable no-undef*/\n",
      errors: [
        {
          ...missingRulePair("eslint-disable", "no-undef"),
          line: 2,
          column: 17,
          endLine: 2,
          endColumn: 25,
        },
      ],
    },
    {
      code: "\n/*eslint-disable no-undef,no-unused-vars*/\n/*eslint-enable no-undef*/\n",
      errors: [
        {
          ...missingRulePair("eslint-disable", "no-unused-vars"),
          line: 2,
          column: 26,
          endLine: 2,
          endColumn: 40,
        },
      ],
    },
    {
      code: "\n/*eslint-disable no-undef*/\n/*eslint-disable no-unused-vars*/\n/*eslint-enable no-unused-vars*/\n",
      errors: [
        {
          ...missingRulePair("eslint-disable", "no-undef"),
          line: 2,
          column: 17,
          endLine: 2,
          endColumn: 25,
        },
      ],
    },
    {
      code: "\n/*eslint-disable no-undef*/\nconsole.log();\n/*eslint-disable no-unused-vars*/\n",
      options: [{ allowWholeFile: true }],
      errors: [
        {
          ...missingRulePair("eslint-disable", "no-unused-vars"),
          line: 4,
          column: 17,
          endLine: 4,
          endColumn: 31,
        },
      ],
    },
    {
      code: "\nconsole.log();\n/*eslint-disable no-unused-vars*/\n",
      options: [{ allowWholeFile: true }],
      errors: [{ ...missingRulePair("eslint-disable", "no-unused-vars"), line: 3, column: 17 }],
    },
    {
      code: "\n{\n/*eslint-disable no-unused-vars*/\n}\n",
      options: [{ allowWholeFile: true }],
      errors: [{ ...missingRulePair("eslint-disable", "no-unused-vars"), line: 3, column: 17 }],
    },
    {
      code: "\n{\n/*eslint-disable no-unused-vars -- description */\n}\n",
      options: [{ allowWholeFile: true }],
      errors: [{ ...missingRulePair("eslint-disable", "no-unused-vars"), line: 3, column: 17 }],
    },
    {
      code: "// eslint-disable no-undef",
      errors: [
        {
          ...missingRulePair("eslint-disable", "no-undef"),
          line: 1,
          column: 18,
          endLine: 1,
          endColumn: 26,
        },
      ],
    },
    // An enable for the other kind of area does not close a block disable.
    {
      code: "/*eslint-disable no-undef*/\n// eslint-disable-line no-undef\n",
      errors: [missingRulePair("eslint-disable", "no-undef")],
    },
  ]),
});
