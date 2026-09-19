# directive-comments/no-use

Disallows directive comments. Off by default.

Some codebases want no inline configuration at all: every rule that fires gets fixed or turned off in the config where everyone can see it. With no options this rule flags every directive comment Oxlint or ESLint would act on. With `allow`, it becomes an allowlist.

## Examples

Bad:

```ts
/* eslint no-undef: off */
/* eslint-env browser */
/* oxlint-disable foo */
/* oxlint-enable bar */
// oxlint-disable-line
// eslint-disable-next-line
/* exported foo */
/* global $ */
/* globals a, b, c */
```

## Options

```json
{
  "directive-comments/no-use": [
    "error",
    {
      "allow": ["oxlint-disable-next-line", "oxlint-disable-line"],
      "additionalDirectives": ["c8"]
    }
  ]
}
```

`allow` lists directives that may appear. Each entry matches the directive exactly as written, so `eslint-disable-next-line` and `oxlint-disable-next-line` are separate entries. The values are `eslint-disable`, `eslint-disable-line`, `eslint-disable-next-line`, `eslint-enable`, their `oxlint-` spellings, the ESLint configuration comments `eslint`, `eslint-env`, `exported`, `global`, and `globals`, and anything listed in `additionalDirectives`.

`additionalDirectives` adds other tools' directive comments to the check, such as `c8` or `istanbul` for coverage.

## Known limitation

A `/* eslint directive-comments/no-use: off */` comment turns this rule off before it runs, in ESLint. Oxlint ignores `eslint` configuration comments, so it does not have that hole.

## Fixable

No.
