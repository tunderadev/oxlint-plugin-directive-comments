import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import { withPrefixes } from "../testing/prefixes.ts";
import rule from "./require-description.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const missing = (kind: string) => ({ messageId: "missingDescription", data: { kind } });

tester.run("require-description", rule, {
  valid: [
    ...withPrefixes([
      "/* eslint-disable -- description */",
      "/* eslint-enable -- description */",
      "// eslint-disable -- description",
      "// eslint-disable-line -- description",
      "// eslint-disable-next-line -- description",
      "/* eslint-disable-line -- description */",
      "/* eslint-disable-next-line -- description */",
      "// eslint-disable-line eqeqeq -- description",
      "// eslint-disable-next-line eqeqeq -- description",
      // Oxlint also reads a single dash with whitespace on both sides as a description.
      "// eslint-disable-next-line eqeqeq - description",
      // Not directives: a disable-line comment cannot span lines, and this is prose.
      "/* eslint-disable-line\n eqeqeq */",
      "/* just eslint in a normal comment */",
      { code: "/* eslint-enable */", options: [{ ignore: ["eslint-enable"] }] },
      { code: "/* eslint-disable */", options: [{ ignore: ["eslint-disable"] }] },
      { code: "// eslint-disable-line", options: [{ ignore: ["eslint-disable-line"] }] },
      { code: "// eslint-disable-next-line", options: [{ ignore: ["eslint-disable-next-line"] }] },
      { code: "/* eslint-disable-line */", options: [{ ignore: ["eslint-disable-line"] }] },
      {
        code: "/* eslint-disable-next-line */",
        options: [{ ignore: ["eslint-disable-next-line"] }],
      },
    ]),
    '/* eslint eqeqeq: "off", curly: "error" -- Here\'s a description about why this configuration is necessary. */',
    "/* eslint-env node -- description */",
    "/* exported -- description */",
    "/* global -- description */",
    "/* globals -- description */",
    "/* c8 without options */",
    // ESLint only reads configuration comments from block comments.
    "// eslint no-undef: off",
    "// global $",
    "#!/usr/bin/env node",
    { code: "/* eslint */", options: [{ ignore: ["eslint"] }] },
    { code: "/* eslint-env */", options: [{ ignore: ["eslint-env"] }] },
    { code: "/* exported */", options: [{ ignore: ["exported"] }] },
    { code: "/* global */", options: [{ ignore: ["global"] }] },
    { code: "/* globals */", options: [{ ignore: ["globals"] }] },
    { code: "/* c8 ignore next -- description */", options: [{ additionalDirectives: ["c8"] }] },
    { code: "/* c8 ignore next */", options: [{ additionalDirectives: ["istanbul"] }] },
  ],
  invalid: [
    ...withPrefixes([
      { code: "/* eslint-enable */", errors: [missing("eslint-enable")] },
      { code: "/* eslint-enable eqeqeq */", errors: [missing("eslint-enable")] },
      { code: "/* eslint-disable eqeqeq */", errors: [missing("eslint-disable")] },
      // Oxlint honours a line comment here, unlike ESLint, so it needs a reason too.
      { code: "// eslint-disable", errors: [missing("eslint-disable")] },
      { code: "// eslint-enable", errors: [missing("eslint-enable")] },
      { code: "// eslint-disable-line", errors: [missing("eslint-disable-line")] },
      { code: "// eslint-disable-line eqeqeq", errors: [missing("eslint-disable-line")] },
      { code: "// eslint-disable-next-line", errors: [missing("eslint-disable-next-line")] },
      { code: "// eslint-disable-next-line eqeqeq", errors: [missing("eslint-disable-next-line")] },
      { code: "/* eslint-disable-line */", errors: [missing("eslint-disable-line")] },
      { code: "/* eslint-disable-line eqeqeq */", errors: [missing("eslint-disable-line")] },
      { code: "/* eslint-disable-next-line */", errors: [missing("eslint-disable-next-line")] },
      {
        code: "/* eslint-disable-next-line eqeqeq */",
        errors: [missing("eslint-disable-next-line")],
      },
      // An empty description does not count.
      {
        code: "/* eslint-disable-next-line eqeqeq -- */",
        errors: [missing("eslint-disable-next-line")],
      },
      {
        code: "// eslint-disable-next-line eqeqeq --",
        errors: [missing("eslint-disable-next-line")],
      },
      // A dash glued to a rule name is part of the name, not a description.
      {
        code: "// eslint-disable-next-line eqeqeq -x",
        errors: [missing("eslint-disable-next-line")],
      },
      // The directive after a shebang still counts.
      {
        code: "#!/usr/bin/env node\n// eslint-disable-next-line",
        errors: [{ ...missing("eslint-disable-next-line"), line: 2 }],
      },
      // Reported on the text inside the delimiters, so the comment cannot hide its own report.
      {
        code: "/* eslint-disable */",
        errors: [{ ...missing("eslint-disable"), line: 1, column: 2, endLine: 1, endColumn: 18 }],
      },
      {
        code: "const a = 1;\n  // eslint-disable-line",
        errors: [
          { ...missing("eslint-disable-line"), line: 2, column: 4, endLine: 2, endColumn: 24 },
        ],
      },
      // The ignore option matches the directive exactly as written.
      {
        code: "/* eslint-disable */",
        options: [{ ignore: ["eslint-disable-line"] }],
        errors: [missing("eslint-disable")],
      },
    ]),
    {
      code: "// oxlint-disable-next-line",
      options: [{ ignore: ["eslint-disable-next-line"] }],
      errors: [missing("oxlint-disable-next-line")],
    },
    { code: "/* eslint */", errors: [missing("eslint")] },
    { code: '/* eslint eqeqeq: "off", curly: "error" */', errors: [missing("eslint")] },
    { code: "/* eslint-env */", errors: [missing("eslint-env")] },
    { code: "/* eslint-env node */", errors: [missing("eslint-env")] },
    { code: "/* exported */", errors: [missing("exported")] },
    { code: "/* global */", errors: [missing("global")] },
    { code: "/* global _ */", errors: [missing("global")] },
    { code: "/* globals */", errors: [missing("globals")] },
    { code: "/* globals _ */", errors: [missing("globals")] },
    {
      code: "/* c8 ignore next */",
      options: [{ additionalDirectives: ["c8"] }],
      errors: [missing("c8")],
    },
    {
      code: "// c8 ignore next",
      options: [{ additionalDirectives: ["c8"] }],
      errors: [missing("c8")],
    },
  ],
});
