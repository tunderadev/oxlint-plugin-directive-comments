# directive-comments/disable-enable-pair

Requires an `enable` comment for every `disable` comment. In `recommended`.

A `/* oxlint-disable */` block comment turns rules off from that line to the end of the file. That is rarely what the author meant. Most of the time they wanted a few lines and forgot to turn the rules back on, and every problem below the comment is now invisible.

## Examples

Bad:

```ts
/* oxlint-disable no-undef, no-unused-vars -- legacy globals */
const foo = bar();
```

```ts
/* eslint-disable no-undef, no-unused-vars -- legacy globals */
const foo = bar();
/* eslint-enable no-unused-vars */
```

Good:

```ts
/* oxlint-disable no-undef, no-unused-vars -- legacy globals */
const foo = bar();
/* oxlint-enable no-undef, no-unused-vars */
```

```ts
/* eslint-disable no-undef, no-unused-vars -- legacy globals */
const foo = bar();
/* eslint-enable */
```

## Options

```json
{
  "directive-comments/disable-enable-pair": ["error", { "allowWholeFile": true }]
}
```

`allowWholeFile` lets a `disable` that comes before the first statement stay open, so a file can opt out of a rule as a whole. A `disable` after code has started still needs its `enable`.

```ts
/* oxlint-disable no-undef -- generated file, globals come from the host */
const foo = bar();
/* oxlint-disable no-unused-vars -- this one is flagged: it opens after code */
const fizz = buzz();
```

## Fixable

No.
