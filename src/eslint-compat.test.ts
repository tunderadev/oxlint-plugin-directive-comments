import { type ESLint, Linter } from "eslint";
import { describe, expect, it } from "vite-plus/test";
import plugin from "./index.ts";

// The README says the package loads in ESLint 9. This keeps that true: eslintCompatPlugin
// has to convert createOnce rules, and forceLocation() takes the column -1 path there.

const linter = new Linter();

function lint(code: string, rules: Linter.RulesRecord, fix = false) {
  const config: Linter.Config = {
    plugins: { "directive-comments": plugin as unknown as ESLint.Plugin },
    rules,
    linterOptions: { reportUnusedDisableDirectives: "off" },
    languageOptions: { ecmaVersion: 2022, sourceType: "module" },
  };
  return fix
    ? linter.verifyAndFix(code, config)
    : { messages: linter.verify(code, config), output: code };
}

const everyRule: Linter.RulesRecord = Object.fromEntries(
  Object.keys(plugin.rules).map((rule) => [`directive-comments/${rule}`, "error"]),
);

describe("ESLint 9 compatibility", () => {
  it("reports a whole-file disable on line 1 despite the comment disabling every rule", () => {
    const { messages } = lint("/* eslint-disable */\nconst a = 1;\n", everyRule);
    expect(messages.map((m) => String(m.ruleId)).toSorted()).toEqual([
      "directive-comments/disable-enable-pair",
      "directive-comments/no-unlimited-disable",
      "directive-comments/no-use",
      "directive-comments/prefer-oxlint-directive",
      "directive-comments/require-description",
    ]);
    // Column -1, shown 1-based, so the comment's own disable cannot cover it.
    expect(messages.every((m) => m.line === 1 && m.column === 0)).toBe(true);
  });

  it("points at the rule name inside the comment", () => {
    const { messages } = lint("/* eslint-disable no-undef */\nfoo();\n", {
      "directive-comments/disable-enable-pair": "error",
    });
    expect(messages).toHaveLength(1);
    expect(messages[0].column).toBe(19);
    expect(messages[0].endColumn).toBe(27);
  });

  it("lints oxlint- comments even though ESLint ignores them", () => {
    const { messages } = lint("// oxlint-disable-next-line no-undef\nfoo();\n", {
      "directive-comments/require-description": "error",
    });
    expect(messages.map((m) => m.message)).toEqual([
      "Missing description on 'oxlint-disable-next-line'. Add ' -- <reason>' to say why the directive is needed.",
    ]);
  });

  it("rewrites the prefix with the autofix", () => {
    const { output } = lint(
      "/*   eslint-disable no-undef */\nfoo(); // eslint-disable-line no-undef -- r\n/* eslint-enable no-undef */\n",
      { "directive-comments/prefer-oxlint-directive": "error" },
      true,
    );
    expect(output).toBe(
      "/*   oxlint-disable no-undef */\nfoo(); // oxlint-disable-line no-undef -- r\n/* oxlint-enable no-undef */\n",
    );
  });

  it("takes options", () => {
    const { messages } = lint("/* eslint-disable eqeqeq -- r */\n/* eslint-enable eqeqeq */\n", {
      "directive-comments/no-restricted-disable": ["error", "eqeqeq"],
    });
    expect(messages.map((m) => m.message)).toEqual(["Disabling 'eqeqeq' is not allowed."]);
  });
});
