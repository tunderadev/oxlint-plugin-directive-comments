import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import { withPrefixes } from "../testing/prefixes.ts";
import rule from "./no-restricted-disable.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const disallow = (ruleId: string) => ({ messageId: "disallow", data: { ruleId } });
const disallowAll = (kind: string) => ({ messageId: "disallowAll", data: { kind } });

tester.run("no-restricted-disable", rule, {
  valid: [
    ...withPrefixes([
      // Without patterns the rule does nothing.
      "/*eslint-disable*/",
      "//eslint-disable-line",
      "//eslint-disable-next-line",
      "/*eslint-disable-line*/",
      "/*eslint-disable-next-line*/",
      { code: "/*eslint-disable eqeqeq*/", options: ["no-unused-vars"] },
      { code: "/*eslint-enable eqeqeq*/", options: ["eqeqeq"] },
      { code: "/*eslint-disable eqeqeq*/", options: ["*", "!eqeqeq"] },
    ]),
    { code: "/* eslint eqeqeq: off */", options: ["eqeqeq"] },
  ],
  invalid: withPrefixes([
    {
      code: "/*eslint-disable-line eqeqeq, no-undef, no-redeclare*/",
      options: ["*", "!no-undef", "!no-redeclare"],
      errors: [disallow("eqeqeq")],
    },
    {
      code: "//eslint-disable-line",
      options: ["*", "!no-undef", "!no-redeclare"],
      errors: [disallowAll("eslint-disable-line")],
    },
    {
      code: "/*eslint-disable-line*/",
      options: ["*", "!no-undef", "!no-redeclare"],
      errors: [disallowAll("eslint-disable-line")],
    },
    {
      code: "//eslint-disable-next-line eqeqeq, no-undef, no-redeclare",
      options: ["*", "!no-undef", "!no-redeclare"],
      errors: [disallow("eqeqeq")],
    },
    {
      code: "/*eslint-disable-next-line eqeqeq, no-undef, no-redeclare*/",
      options: ["*", "!no-undef", "!no-redeclare"],
      errors: [disallow("eqeqeq")],
    },
    {
      code: "//eslint-disable-next-line",
      options: ["*", "!no-undef", "!no-redeclare"],
      errors: [disallowAll("eslint-disable-next-line")],
    },
    {
      code: "/*eslint-disable-next-line*/",
      options: ["*", "!no-undef", "!no-redeclare"],
      errors: [disallowAll("eslint-disable-next-line")],
    },
    {
      code: "/*eslint-disable eqeqeq*/",
      options: ["eqeqeq"],
      errors: [{ ...disallow("eqeqeq"), line: 1, column: 17, endLine: 1, endColumn: 23 }],
    },
    {
      code: "/*eslint-disable*/",
      options: ["eqeqeq"],
      errors: [{ ...disallowAll("eslint-disable"), column: 2, endColumn: 16 }],
    },
    { code: "//eslint-disable-line eqeqeq", options: ["eqeqeq"], errors: [disallow("eqeqeq")] },
    { code: "/*eslint-disable-line eqeqeq*/", options: ["eqeqeq"], errors: [disallow("eqeqeq")] },
    {
      code: "//eslint-disable-line",
      options: ["eqeqeq"],
      errors: [disallowAll("eslint-disable-line")],
    },
    {
      code: "/*eslint-disable-line*/",
      options: ["eqeqeq"],
      errors: [disallowAll("eslint-disable-line")],
    },
    {
      code: "//eslint-disable-next-line eqeqeq",
      options: ["eqeqeq"],
      errors: [disallow("eqeqeq")],
    },
    {
      code: "/*eslint-disable-next-line eqeqeq*/",
      options: ["eqeqeq"],
      errors: [disallow("eqeqeq")],
    },
    {
      code: "//eslint-disable-next-line",
      options: ["eqeqeq"],
      errors: [disallowAll("eslint-disable-next-line")],
    },
    {
      code: "/*eslint-disable-next-line*/",
      options: ["eqeqeq"],
      errors: [disallowAll("eslint-disable-next-line")],
    },
    {
      code: "/*eslint-disable eqeqeq, no-undef, no-redeclare*/",
      options: ["*", "!no-undef", "!no-redeclare"],
      errors: [disallow("eqeqeq")],
    },
    {
      code: "/*eslint-disable*/",
      options: ["*", "!no-undef", "!no-redeclare"],
      errors: [disallowAll("eslint-disable")],
    },
    {
      code: "//eslint-disable-line eqeqeq, no-undef, no-redeclare",
      options: ["*", "!no-undef", "!no-redeclare"],
      errors: [disallow("eqeqeq")],
    },
    {
      code: "/*eslint-disable semi, no-extra-semi, semi-style, comma-style*/",
      options: ["*semi*"],
      errors: [disallow("semi"), disallow("no-extra-semi"), disallow("semi-style")],
    },
    {
      code: "/*eslint-disable no-undef, no-redeclare, foo/no-undef, foo/no-redeclare*/",
      options: ["foo/*"],
      errors: [disallow("foo/no-undef"), disallow("foo/no-redeclare")],
    },
    {
      code: "/*eslint-disable -- description*/",
      options: ["eqeqeq"],
      errors: [disallowAll("eslint-disable")],
    },
    {
      code: "// eslint-disable eqeqeq",
      options: ["eqeqeq"],
      errors: [disallow("eqeqeq")],
    },
  ]),
});
