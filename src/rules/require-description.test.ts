import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vite-plus/test";
import rule from "./require-description.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

tester.run("require-description", rule, {
  valid: ["const ok = 1;"],
  invalid: [
    {
      code: "const TODO_REPLACE_ME = 1;",
      errors: [{ messageId: "found" }],
    },
  ],
});
