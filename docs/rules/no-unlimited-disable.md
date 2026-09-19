# directive-comments/no-unlimited-disable

Disallows `disable` comments that do not name a rule. In `recommended`.

A bare `// oxlint-disable-next-line` turns off every rule for that line, including ones added to the config later. Naming the rule keeps the other rules working and tells the reader what was wrong.

## Examples

Bad:

```ts
const foo = bar(); // oxlint-disable-line
```

```ts
/* eslint-disable -- old code */
```

Good:

```ts
const foo = bar(); // oxlint-disable-line no-undef
```

```ts
/* eslint-disable no-undef, no-var -- old code */
```

## Options

None.

## Fixable

No.
