<img src="assets/logo.svg" width="96" align="right" alt="">

# oxlint-plugin-directive-comments

[![npm version](https://img.shields.io/npm/v/oxlint-plugin-directive-comments?style=flat&colorA=080f12&colorB=9ca3af)](https://npmjs.com/package/oxlint-plugin-directive-comments)
[![npm downloads](https://img.shields.io/npm/dm/oxlint-plugin-directive-comments?style=flat&colorA=080f12&colorB=9ca3af)](https://npmjs.com/package/oxlint-plugin-directive-comments)
[![CI](https://github.com/tunderadev/oxlint-plugin-directive-comments/actions/workflows/ci.yml/badge.svg)](https://github.com/tunderadev/oxlint-plugin-directive-comments/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-080f12?style=flat&colorA=080f12&colorB=9ca3af)](LICENSE)

**DESCRIPTION**

It catches things like:

```ts
// FIXME: handle empty input     ← no-fixme
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
import plugin from "oxlint-plugin-directive-comments";

export default defineConfig({
  extends: [plugin.configs.recommended],
});
```

Or `.oxlintrc.json`:

```json
{
  "jsPlugins": ["oxlint-plugin-directive-comments"],
  "rules": {
    "template/no-fixme": "warn"
  }
}
```

The same package loads in ESLint 9: `plugins: { template: plugin }`.

## Rules

🔧 has an autofix. ✅ is in `recommended`.

<!-- rules:start -->

| Rule                                                     | What it flags                                         | 🔧  | ✅  |
| -------------------------------------------------------- | ----------------------------------------------------- | --- | --- |
| [require-description](docs/rules/require-description.md) | Require a reason after -- on every directive comment. |     | ✅  |

<!-- rules:end -->

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). The short version: `pnpm new-rule <name>` scaffolds a rule with its test and doc page, PR titles are conventional commits, and issues labelled `good first issue` are a fine place to start.

## License

MIT
