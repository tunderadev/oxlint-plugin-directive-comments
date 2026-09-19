# directive-comments/no-aggregating-enable

Disallows one `enable` comment that closes several `disable` comments. In `recommended`.

A bare `/* oxlint-enable */` turns every disabled rule back on, including ones disabled far above it that the author may not have had in mind. Pairing each `enable` with its own `disable` keeps the disabled region readable: you can see where each rule goes off and where it comes back.

## Examples

Bad:

```ts
/* oxlint-disable no-undef -- host global */
f();
/* oxlint-disable no-var -- generated */
var a;
/* oxlint-enable */
```

```ts
/* oxlint-disable no-undef -- host global */
f();
/* oxlint-disable no-var -- generated */
var a;
/* oxlint-enable no-undef, no-var */
```

Good:

```ts
/* oxlint-disable no-undef -- host global */
f();
/* oxlint-disable no-var -- generated */
var a;
/* oxlint-enable no-var */
/* oxlint-enable no-undef */
```

## Options

None.

## Fixable

No.
