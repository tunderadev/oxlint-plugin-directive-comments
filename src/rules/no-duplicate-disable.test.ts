import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import { withPrefixes } from "../testing/prefixes.ts";
import rule from "./no-duplicate-disable.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const duplicateRule = (ruleId: string) => ({ messageId: "duplicateRule", data: { ruleId } });

tester.run("no-duplicate-disable", rule, {
  valid: withPrefixes([
    "\n//eslint-disable-line\n",
    "\n/*eslint-disable-line*/\n",
    "\n/*eslint-disable no-undef*/\n//eslint-disable-line no-unused-vars\n//eslint-disable-next-line semi\n/*eslint-disable eqeqeq*/\n",
    "\n/*eslint-disable no-undef*/\n/*eslint-disable-line no-unused-vars*/\n/*eslint-disable-next-line semi*/\n/*eslint-disable eqeqeq*/\n",
    // Once enabled again, a second disable is fine.
    "/*eslint-disable no-undef*/\n/*eslint-enable no-undef*/\n/*eslint-disable no-undef*/",
  ]),
  invalid: withPrefixes([
    {
      code: "\n/*eslint-disable*/\n//eslint-disable-line\n",
      errors: [{ messageId: "duplicate", data: {}, line: 3, column: 2, endLine: 3, endColumn: 21 }],
    },
    {
      code: "\n/*eslint-disable no-undef*/\n//eslint-disable-line no-undef\n",
      errors: [{ ...duplicateRule("no-undef"), line: 3, column: 22, endLine: 3, endColumn: 30 }],
    },
    {
      code: "\n/*eslint-disable no-undef*/\n/*eslint-disable-line no-undef*/\n",
      errors: [{ ...duplicateRule("no-undef"), line: 3, column: 22, endLine: 3, endColumn: 30 }],
    },
    {
      code: "\n/*eslint-disable no-undef*/\n//eslint-disable-next-line no-undef\n",
      errors: [{ ...duplicateRule("no-undef"), line: 3, column: 27, endLine: 3, endColumn: 35 }],
    },
    {
      code: "\n/*eslint-disable no-undef*/\n/*eslint-disable-next-line no-undef*/\n",
      errors: [{ ...duplicateRule("no-undef"), line: 3, column: 27, endLine: 3, endColumn: 35 }],
    },
    {
      code: "\n//eslint-disable-next-line no-undef\n//eslint-disable-line no-undef\n",
      errors: [{ ...duplicateRule("no-undef"), line: 3, column: 22, endLine: 3, endColumn: 30 }],
    },
    {
      code: "\n/*eslint-disable-next-line no-undef*/\n/*eslint-disable-line no-undef*/\n",
      errors: [{ ...duplicateRule("no-undef"), line: 3, column: 22, endLine: 3, endColumn: 30 }],
    },
    {
      code: "\n// eslint-disable-next-line no-undef -- description\n// eslint-disable-line no-undef -- description\n",
      errors: [{ ...duplicateRule("no-undef"), line: 3, column: 23, endLine: 3, endColumn: 31 }],
    },
    // A rule named twice in one comment. The report points at the first occurrence.
    {
      code: "/*eslint-disable no-undef, no-undef*/",
      errors: [{ ...duplicateRule("no-undef"), line: 1, column: 17, endLine: 1, endColumn: 25 }],
    },
    // The whole-file disable is a block comment; the duplicate is a line comment.
    {
      code: "// eslint-disable\nfoo(); // eslint-disable-line no-undef",
      errors: [{ ...duplicateRule("no-undef"), line: 2 }],
    },
  ]),
});
