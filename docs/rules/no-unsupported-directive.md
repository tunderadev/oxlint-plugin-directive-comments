# directive-comments/no-unsupported-directive

Flags ESLint configuration comments that Oxlint reads past without a word. In `recommended` as a warning.

Oxlint understands `disable` and `enable` comments in both spellings. It does not understand `/* eslint ... */`, `/* eslint-env ... */`, `/* global ... */`, `/* globals ... */`, or `/* exported ... */`, and it does not tell you. A `/* global $ */` that used to declare jQuery now does nothing, and `no-undef` fires or does not fire for reasons nobody can see in the file.

## Examples

Bad:

```ts
/* eslint no-undef: off */
/* eslint-env browser */
/* global $ */
/* globals a, b */
/* exported foo */
```

Good:

```jsonc
// .oxlintrc.json
{
  "env": { "browser": true },
  "globals": { "$": "readonly", "a": "readonly", "b": "readonly" },
  "rules": { "no-undef": "off" },
}
```

```ts
// oxlint-disable-next-line no-undef -- host global
foo();
```

Each report says where the setting belongs. `exported` has no Oxlint equivalent, so the rule only tells you it is ignored.

If ESLint still lints the same files and relies on these comments, turn this rule off for that project. Oxlint's silence is the problem this rule exists to break, and only you know whether the comment is still doing a job for another tool.

## Options

None.

## Fixable

No.
