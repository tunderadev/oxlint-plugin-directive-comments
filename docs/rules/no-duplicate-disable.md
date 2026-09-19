# directive-comments/no-duplicate-disable

Disallows disabling a rule that an earlier comment already disabled. In `recommended`.

A duplicate usually means a wide `disable` and a narrow one have drifted together. The narrow one looks like it does something, and a reader trusts it. Then the wide one moves or gets removed and the narrow one was never enough on its own, or the other way round. One directive per disabled rule per region keeps the story straight.

## Examples

Bad:

```ts
/* oxlint-disable no-undef -- host globals */
const foo = bar(); // oxlint-disable-line no-undef
```

Good:

```ts
/* oxlint-disable no-undef -- host globals */
const foo = bar();
```

```ts
const foo = bar(); // oxlint-disable-line no-undef -- host global
```

## Options

None.

## Fixable

No.
