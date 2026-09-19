# directive-comments/no-restricted-disable

Disallows `disable` comments for the rules you name. Off by default, because the list is yours to write.

Some rules should never be switched off inline: a security rule, or a rule the team agreed to fix rather than silence. This rule turns that agreement into a lint error.

## Examples

With `["error", "no-undef", "no-unused-vars"]`:

Bad:

```ts
/* oxlint-disable no-undef -- host global */
f();
```

```ts
f(); // oxlint-disable-line no-undef
```

```ts
f(); // oxlint-disable-line
```

The last one is flagged because a `disable` without rule names disables the restricted rules too.

Good:

```ts
f(); // oxlint-disable-line another-rule -- reason
```

## Options

The rule takes a list of gitignore-style patterns, matched against the rule ids in each `disable` comment. Patterns come from the [`ignore`](https://www.npmjs.com/package/ignore) package, so `*` matches any rule, `!` negates, and `plugin/*` matches every rule of one plugin.

```json
{
  "directive-comments/no-restricted-disable": ["error", "no-undef", "*semi*", "react/*"]
}
```

```json
{
  "directive-comments/no-restricted-disable": ["error", "*", "!no-console"]
}
```

## Fixable

No.
