# directive-comments/prefer-oxlint-directive

Prefers `oxlint-disable` over `eslint-disable`, and the same for the rest of the family. Off by default. Has an autofix.

Oxlint reads both spellings. Once a project has left ESLint behind, the `eslint-` comments are a small lie: they name a tool that no longer runs. The `oxlint-` spelling says which linter the comment is for, and stops a future ESLint from acting on comments meant for Oxlint.

Do not enable this rule while ESLint still lints the same files. ESLint ignores `oxlint-` comments, so the fix would switch those suppressions off in ESLint.

## Examples

Bad:

```ts
// eslint-disable-next-line no-console -- CLI output
console.log(report);

/* eslint-disable no-await-in-loop -- sequential by design */
for (const job of jobs) await run(job);
/* eslint-enable no-await-in-loop */
```

Good:

```ts
// oxlint-disable-next-line no-console -- CLI output
console.log(report);

/* oxlint-disable no-await-in-loop -- sequential by design */
for (const job of jobs) await run(job);
/* oxlint-enable no-await-in-loop */
```

ESLint configuration comments such as `/* eslint no-undef: off */` and `/* global $ */` have no `oxlint-` spelling. `no-unsupported-directive` covers those.

## Options

None.

## Fixable

Yes. The fix rewrites the prefix and leaves the rest of the comment alone.
