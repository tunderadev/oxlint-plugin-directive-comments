import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import { withPrefixes } from "../testing/prefixes.ts";
import rule from "./no-unlimited-disable.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const unexpected = (kind: string) => ({ messageId: "unexpected", data: { kind } });

tester.run("no-unlimited-disable", rule, {
  valid: [
    ...withPrefixes([
      "/*eslint-enable*/",
      "/*eslint-disable eqeqeq*/",
      "//eslint-disable-line eqeqeq",
      "//eslint-disable-next-line eqeqeq",
      "/*eslint-disable-line eqeqeq*/",
      "/*eslint-disable-next-line eqeqeq*/",
      "var foo;\n//eslint-disable-line eqeqeq",
      "var foo;\n/*eslint-disable-line eqeqeq*/",
      "// eslint-disable eqeqeq",
      // A single dash with spaces starts a description, so the rule name still counts.
      "// eslint-disable-next-line eqeqeq - description",
    ]),
    "/* eslint no-undef: off */",
    "/* eslint-disable-line\n eqeqeq */",
    // Not a directive: the label needs whitespace or the end after it.
    "/* eslint-disable-- x */",
  ],
  invalid: withPrefixes([
    // Oxlint honours a disable-line block comment that spans lines.
    { code: "/* eslint-disable-line\n */", errors: [unexpected("eslint-disable-line")] },
    {
      code: "/*eslint-disable */",
      errors: [{ ...unexpected("eslint-disable"), line: 1, column: 2, endLine: 1, endColumn: 17 }],
    },
    { code: "/* eslint-disable */", errors: [unexpected("eslint-disable")] },
    { code: "// eslint-disable", errors: [unexpected("eslint-disable")] },
    { code: "//eslint-disable-line", errors: [unexpected("eslint-disable-line")] },
    { code: "/*eslint-disable-line*/", errors: [unexpected("eslint-disable-line")] },
    { code: "// eslint-disable-line ", errors: [unexpected("eslint-disable-line")] },
    { code: "/* eslint-disable-line */", errors: [unexpected("eslint-disable-line")] },
    { code: "//eslint-disable-next-line", errors: [unexpected("eslint-disable-next-line")] },
    { code: "/*eslint-disable-next-line*/", errors: [unexpected("eslint-disable-next-line")] },
    { code: "// eslint-disable-next-line ", errors: [unexpected("eslint-disable-next-line")] },
    { code: "/* eslint-disable-next-line */", errors: [unexpected("eslint-disable-next-line")] },
    {
      code: "var foo;\n//eslint-disable-line",
      errors: [{ ...unexpected("eslint-disable-line"), line: 2 }],
    },
    {
      code: "var foo;\n/*eslint-disable-line*/",
      errors: [{ ...unexpected("eslint-disable-line"), line: 2 }],
    },
    { code: "/*eslint-disable -- description */", errors: [unexpected("eslint-disable")] },
    {
      code: "// eslint-disable-next-line - description",
      errors: [unexpected("eslint-disable-next-line")],
    },
  ]),
});
