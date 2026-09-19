import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import rule from "./prefer-oxlint-directive.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const prefer = (kind: string) => ({
  messageId: "preferOxlint",
  data: { kind, replacement: kind.replace("eslint-", "oxlint-") },
});

tester.run("prefer-oxlint-directive", rule, {
  valid: [
    "/* oxlint-disable */",
    "/* oxlint-enable */",
    "// oxlint-disable-line",
    "// oxlint-disable-next-line no-undef -- reason",
    "/* oxlint-disable-next-line no-undef */",
    // Configuration comments have no oxlint- spelling. See no-unsupported-directive.
    "/* eslint no-undef: off */",
    "/* eslint-env node */",
    "/* global $ */",
    // Not directives.
    "/* eslint-disable--x */",
    "/* the words eslint-disable in prose */",
    "// eslint-disabled",
  ],
  invalid: [
    {
      code: "/* eslint-disable-line\n no-undef */",
      output: "/* oxlint-disable-line\n no-undef */",
      errors: [prefer("eslint-disable-line")],
    },
    {
      code: "// eslint-disable-next-line no-undef",
      output: "// oxlint-disable-next-line no-undef",
      errors: [prefer("eslint-disable-next-line")],
    },
    {
      code: "/* eslint-disable */",
      output: "/* oxlint-disable */",
      errors: [{ ...prefer("eslint-disable"), line: 1, column: 2, endLine: 1, endColumn: 18 }],
    },
    {
      code: "/*eslint-disable no-undef -- reason*/",
      output: "/*oxlint-disable no-undef -- reason*/",
      errors: [prefer("eslint-disable")],
    },
    {
      code: "/* eslint-enable */",
      output: "/* oxlint-enable */",
      errors: [prefer("eslint-enable")],
    },
    {
      code: "foo(); // eslint-disable-line no-undef",
      output: "foo(); // oxlint-disable-line no-undef",
      errors: [prefer("eslint-disable-line")],
    },
    {
      code: "// eslint-disable",
      output: "// oxlint-disable",
      errors: [prefer("eslint-disable")],
    },
    {
      code: "/*   eslint-disable */",
      output: "/*   oxlint-disable */",
      errors: [prefer("eslint-disable")],
    },
    {
      code: "/* eslint-disable\n   no-undef */",
      output: "/* oxlint-disable\n   no-undef */",
      errors: [prefer("eslint-disable")],
    },
    {
      code: "/* eslint-disable no-undef */\nfoo();\n/* eslint-enable no-undef */",
      output: "/* oxlint-disable no-undef */\nfoo();\n/* oxlint-enable no-undef */",
      errors: [
        { ...prefer("eslint-disable"), line: 1 },
        { ...prefer("eslint-enable"), line: 3 },
      ],
    },
  ],
});
