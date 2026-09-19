<img src="https://raw.githubusercontent.com/tunderadev/oxlint-plugin-directive-comments/main/assets/logo.svg" width="96" align="right" alt="">

# oxlint-plugin-directive-comments

[![npm version](https://img.shields.io/npm/v/oxlint-plugin-directive-comments?style=flat&colorA=080f12&colorB=f5a524)](https://npmjs.com/package/oxlint-plugin-directive-comments)
[![npm downloads](https://img.shields.io/npm/dm/oxlint-plugin-directive-comments?style=flat&colorA=080f12&colorB=f5a524)](https://npmjs.com/package/oxlint-plugin-directive-comments)
[![CI](https://github.com/tunderadev/oxlint-plugin-directive-comments/actions/workflows/ci.yml/badge.svg)](https://github.com/tunderadev/oxlint-plugin-directive-comments/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-080f12?style=flat&colorA=080f12&colorB=f5a524)](LICENSE)

Lint your `oxlint-disable` and `eslint-disable` comments.

Oxlint reads both spellings, so this plugin does too. Seven rules are ports of [eslint-plugin-eslint-comments](https://github.com/eslint-community/eslint-plugin-eslint-comments) with the same names and options. Two are new and only make sense for Oxlint.

It catches things like:

```ts
/* oxlint-disable no-undef */                  ← disable-enable-pair: never turned back on
const x = y; // eslint-disable-line            ← no-unlimited-disable: which rule?
// oxlint-disable-next-line no-console         ← require-description: why?
/* global $ */                                 ← no-unsupported-directive: Oxlint ignores this
// eslint-disable-next-line no-debugger        ← prefer-oxlint-directive: fixable to oxlint-
```

## Install

```sh
npm i -D oxlint oxlint-plugin-directive-comments
pnpm add -D oxlint oxlint-plugin-directive-comments
yarn add -D oxlint oxlint-plugin-directive-comments
bun add -d oxlint oxlint-plugin-directive-comments
```

## Use

`oxlint.config.ts`:

```ts
import { defineConfig } from "oxlint";
import directiveComments from "oxlint-plugin-directive-comments";

export default defineConfig({
  extends: [directiveComments.configs.recommended],
});
```

Or `.oxlintrc.json`. A string `extends` does not carry `jsPlugins` across ([oxc#17320](https://github.com/oxc-project/oxc/issues/17320)), so list the rules yourself:

```json
{
  "jsPlugins": ["oxlint-plugin-directive-comments"],
  "rules": {
    "directive-comments/disable-enable-pair": "error",
    "directive-comments/no-aggregating-enable": "error",
    "directive-comments/no-duplicate-disable": "error",
    "directive-comments/no-unlimited-disable": "error",
    "directive-comments/no-unsupported-directive": "warn"
  }
}
```

That is what `recommended` enables. `require-description` is the rule people ask for by name, and it is one more line: `"directive-comments/require-description": "error"`.

The same package loads in ESLint 9: `plugins: { "directive-comments": directiveComments }`, then enable rules under that prefix.

## Rules

🔧 has an autofix. ✅ is in `recommended`.

<!-- rules:start -->

| Rule                                                               | What it flags                                                                              | 🔧  | ✅  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --- | --- |
| [disable-enable-pair](docs/rules/disable-enable-pair.md)           | A `disable` comment with no matching `enable`.                                             |     | ✅  |
| [no-aggregating-enable](docs/rules/no-aggregating-enable.md)       | One `enable` comment that closes several `disable` comments.                               |     | ✅  |
| [no-duplicate-disable](docs/rules/no-duplicate-disable.md)         | Disabling a rule that an earlier comment already disabled.                                 |     | ✅  |
| [no-restricted-disable](docs/rules/no-restricted-disable.md)       | `disable` comments for rules you list, with gitignore-style patterns.                      |     |     |
| [no-unlimited-disable](docs/rules/no-unlimited-disable.md)         | `disable` comments that do not name a rule.                                                |     | ✅  |
| [no-unsupported-directive](docs/rules/no-unsupported-directive.md) | `eslint`, `eslint-env`, `global`, `globals`, and `exported` comments. Oxlint ignores them. |     | ✅  |
| [no-use](docs/rules/no-use.md)                                     | Any directive comment, or any not in `allow`.                                              |     |     |
| [prefer-oxlint-directive](docs/rules/prefer-oxlint-directive.md)   | `eslint-disable` and friends. Rewrites the prefix to `oxlint-`.                            | 🔧  |     |
| [require-description](docs/rules/require-description.md)           | Directive comments without a ` -- reason`.                                                 |     |     |

<!-- rules:end -->

`no-unsupported-directive` is a warning in `recommended` because a project that still runs ESLint on the same files may need those comments. `prefer-oxlint-directive` stays off for the same reason: ESLint ignores `oxlint-` comments, so the fix would switch them off there.

### Things worth knowing

- There is no `no-inline-config` rule. `no-use` with `{ "allow": [] }` (the default) bans every directive comment, which is what [oxc#15173](https://github.com/oxc-project/oxc/issues/15173) asks for.
- Oxlint honours `// eslint-disable` and `// eslint-enable` written as line comments. ESLint does not. This plugin treats them as directives everywhere, because Oxlint does.
- Oxlint reads ` -- reason` and ` - reason` as a description. ESLint only reads `--`. `require-description` accepts both; write `--` if both linters run.
- Option lists such as `ignore` and `allow` match the directive exactly as written. To cover both spellings, list both: `["eslint-disable", "oxlint-disable"]`.
- Oxlint's own `--report-unused-disable-directives` can report the same comment `disable-enable-pair` does. That is two true statements about one comment, not a conflict.
- In Oxlint, reports land on the text between the comment delimiters, which is the one span the comment's own `disable` never covers. A `/* oxlint-disable */` at the top of a file cannot hide the report about itself. Under ESLint the plugin reports at column -1, as the upstream plugin does.
- A directive can still hide reports about a different directive. In Oxlint, `// oxlint-disable-next-line` silences everything this plugin would say about a directive on the next line, and a `/* oxlint-disable */` block silences reports about every comment below it, in both linters. Those are the directives doing their job.
- Oxlint also honours a `/* oxlint-disable-line */` block comment that spans lines. ESLint ignores it. This plugin counts it.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). The short version: `pnpm new-rule <name>` scaffolds a rule with its test and doc page, PR titles are conventional commits like `feat(require-description): add ignore option`, and issues labelled `good first issue` are a fine place to start.

## License

MIT
