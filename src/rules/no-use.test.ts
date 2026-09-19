import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import { withPrefixes } from "../testing/prefixes.ts";
import rule from "./no-use.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const disallow = (kind: string) => ({ messageId: "disallow", data: { kind } });

tester.run("no-use", rule, {
  valid: [
    ...withPrefixes([
      { code: "/* eslint-enable */", options: [{ allow: ["eslint-enable"] }] },
      { code: "/* eslint-disable */", options: [{ allow: ["eslint-disable"] }] },
      { code: "// eslint-disable-line", options: [{ allow: ["eslint-disable-line"] }] },
      { code: "// eslint-disable-next-line", options: [{ allow: ["eslint-disable-next-line"] }] },
      { code: "/* eslint-disable-line */", options: [{ allow: ["eslint-disable-line"] }] },
      {
        code: "/* eslint-disable-next-line */",
        options: [{ allow: ["eslint-disable-next-line"] }],
      },
    ]),
    // ESLint reads configuration comments from block comments only.
    "// eslint foo",
    "// exported",
    "// global",
    "// globals",
    "// eslint-env",
    "/* just eslint in a normal comment */",
    "/* eslint-disable--x is not a directive */",
    { code: "/* eslint */", options: [{ allow: ["eslint"] }] },
    { code: "/* eslint-env */", options: [{ allow: ["eslint-env"] }] },
    { code: "/* exported */", options: [{ allow: ["exported"] }] },
    { code: "/* global */", options: [{ allow: ["global"] }] },
    { code: "/* globals */", options: [{ allow: ["globals"] }] },
    {
      code: "/* c8 ignore next */",
      options: [{ allow: ["globals", "c8"], additionalDirectives: ["c8"] }],
    },
    { code: "/* c8 ignore next */", options: [{ additionalDirectives: ["sthelse"] }] },
    {
      code: "/* c8 ignore next */",
      options: [{ allow: ["globals"], additionalDirectives: ["sthelse"] }],
    },
  ],
  invalid: [
    ...withPrefixes([
      // Oxlint honours a disable-line block comment that spans lines.
      { code: "/* eslint-disable-line\n */", errors: [disallow("eslint-disable-line")] },
      { code: "/* eslint-enable */", errors: [disallow("eslint-enable")] },
      { code: "/* eslint-disable */", errors: [disallow("eslint-disable")] },
      // Oxlint honours these as line comments, so they count.
      { code: "// eslint-disable", errors: [disallow("eslint-disable")] },
      { code: "// eslint-enable", errors: [disallow("eslint-enable")] },
      { code: "// eslint-disable-line", errors: [disallow("eslint-disable-line")] },
      { code: "// eslint-disable-next-line", errors: [disallow("eslint-disable-next-line")] },
      { code: "/* eslint-disable-line */", errors: [disallow("eslint-disable-line")] },
      { code: "/* eslint-disable-next-line */", errors: [disallow("eslint-disable-next-line")] },
      {
        code: "/* eslint-disable */",
        options: [{ allow: ["globals"], additionalDirectives: ["sthelse"] }],
        errors: [disallow("eslint-disable")],
      },
      // `allow` matches the directive exactly as written.
      {
        code: "/* eslint-disable */",
        options: [{ allow: ["eslint-disable-line"] }],
        errors: [disallow("eslint-disable")],
      },
    ]),
    {
      code: "// oxlint-disable-next-line",
      options: [{ allow: ["eslint-disable-next-line"] }],
      errors: [disallow("oxlint-disable-next-line")],
    },
    { code: "/* eslint */", errors: [disallow("eslint")] },
    { code: "/* eslint-env */", errors: [disallow("eslint-env")] },
    { code: "/* exported */", errors: [disallow("exported")] },
    { code: "/* global */", errors: [disallow("global")] },
    { code: "/* globals */", errors: [disallow("globals")] },
    {
      code: "/* c8 ignore next */",
      options: [{ additionalDirectives: ["c8"] }],
      errors: [disallow("c8")],
    },
    {
      code: "/* c8 ignore next */",
      options: [{ allow: ["globals"], additionalDirectives: ["c8"] }],
      errors: [disallow("c8")],
    },
  ],
});
