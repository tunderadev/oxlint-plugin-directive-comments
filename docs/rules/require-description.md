# directive-comments/require-description

Requires a description on every directive comment. Write it after `--`.

A disable comment without a reason is a mystery to the next reader. They cannot tell whether the rule was wrong here, whether a fix was planned, or whether someone was in a hurry. The reason costs one clause and answers all three questions.

## Examples

Bad:

```ts
// oxlint-disable-next-line no-console
console.log(report);

/* eslint-disable no-await-in-loop */
for (const job of jobs) await run(job);
/* eslint-enable no-await-in-loop */
```

Good:

```ts
// oxlint-disable-next-line no-console -- this is the CLI's only output channel
console.log(report);

/* eslint-disable no-await-in-loop -- jobs must run one at a time */
for (const job of jobs) await run(job);
/* eslint-enable no-await-in-loop */
```

Oxlint also reads a single dash with whitespace on both sides as a description, so `-- reason` and ` - reason` both pass. ESLint only knows the `--` form. Use `--` if the file is linted by both.

## Options

```json
{
  "directive-comments/require-description": [
    "error",
    { "ignore": ["eslint-enable", "oxlint-enable"], "additionalDirectives": ["c8"] }
  ]
}
```

`ignore` lists directives that do not need a description. Each entry matches the directive exactly as written, so `eslint-disable` and `oxlint-disable` are separate entries. The values are `eslint-disable`, `eslint-disable-line`, `eslint-disable-next-line`, `eslint-enable`, their `oxlint-` spellings, and the ESLint configuration comments `eslint`, `eslint-env`, `exported`, `global`, and `globals`.

`additionalDirectives` adds other tools' directive comments to the check, such as `c8` or `istanbul` for coverage. Their descriptions follow the same `--` convention.

## Fixable

No.
