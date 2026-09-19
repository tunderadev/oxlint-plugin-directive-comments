import type { Comment, SourceCode } from "@oxlint/plugins";

export const PREFIXES = ["eslint", "oxlint"] as const;
export type Prefix = (typeof PREFIXES)[number];

export const DISABLE_KINDS = ["disable", "disable-line", "disable-next-line", "enable"] as const;
export type DisableKind = (typeof DISABLE_KINDS)[number];

// Configuration comments ESLint reads from block comments. Oxlint ignores every one of them.
export const CONFIG_KINDS = ["eslint", "eslint-env", "exported", "global", "globals"] as const;
export type ConfigKind = (typeof CONFIG_KINDS)[number];

// Every directive name a linter understands, spelled the way it appears in a comment.
export const BUILTIN_KINDS: readonly string[] = [
  ...PREFIXES.flatMap((prefix) => DISABLE_KINDS.map((kind) => `${prefix}-${kind}`)),
  ...CONFIG_KINDS,
];

export interface DirectiveComment {
  // The directive as written: "oxlint-disable-next-line", "eslint", "globals", or an additional
  // directive such as "c8".
  kind: string;
  // Set for the disable and enable family only.
  prefix: Prefix | null;
  // The disable or enable kind without its prefix. Null for other directives.
  disableKind: DisableKind | null;
  // Text between the directive and the description. Rule names, for the disable family.
  value: string;
  // Text after the description separator. Null when the comment has none or it is empty.
  description: string | null;
  // False for directives that only count because of an `additionalDirectives` option.
  builtin: boolean;
  node: Comment;
}

// The same shape Oxlint's `getDisableDirectives()` matches, with the prefix captured.
const DISABLE_PATTERN = /^(eslint|oxlint)-(disable(?:(?:-next)?-line)?|enable)(?=\s|$)/u;
const CONFIG_PATTERN = /^(?:eslint(?:-env)?|exported|globals?)(?=\s|$)/u;
const RULE_ID_DELIMITER = /[\s,]+/u;

/**
 * Every directive comment in the file, in source order.
 *
 * Differences from ESLint worth knowing: Oxlint honours `// eslint-disable` and `// eslint-enable`
 * written as line comments, and a `disable-line` block comment that spans lines, so both count
 * here too. The configuration kinds (`eslint`, `global` and friends) only count in block comments,
 * which is the only place ESLint reads them.
 */
export function getDirectiveComments(
  sourceCode: SourceCode,
  additionalDirectives: readonly string[] = [],
): DirectiveComment[] {
  const additionalPattern =
    additionalDirectives.length > 0
      ? new RegExp(`^(?:${additionalDirectives.map(escapeRegExp).join("|")})(?=\\s|$)`, "u")
      : null;
  const result: DirectiveComment[] = [];
  for (const comment of sourceCode.getAllComments()) {
    const directive = parseDirectiveComment(comment, additionalPattern);
    if (directive !== null) {
      result.push(directive);
    }
  }
  return result;
}

// Rule ids named by a disable or enable directive, or null when it names none and so covers every rule.
export function splitRuleIds(value: string): string[] | null {
  const ids = value.split(RULE_ID_DELIMITER).filter((id) => id !== "");
  return ids.length > 0 ? ids : null;
}

function parseDirectiveComment(
  comment: Comment,
  additionalPattern: RegExp | null,
): DirectiveComment | null {
  if (comment.type === "Shebang") {
    return null;
  }
  // Match the label first. A description separator only counts after it, so `eslint-disable--x`
  // is not a directive, which is how both linters read it.
  const text = comment.value.trimStart();

  const disable = DISABLE_PATTERN.exec(text);
  if (disable !== null) {
    return {
      kind: disable[0],
      prefix: disable[1] as Prefix,
      disableKind: disable[2] as DisableKind,
      ...splitDescription(text.slice(disable[0].length)),
      builtin: true,
      node: comment,
    };
  }

  if (comment.type === "Block") {
    const config = CONFIG_PATTERN.exec(text);
    if (config !== null) {
      return {
        kind: config[0],
        prefix: null,
        disableKind: null,
        ...splitDescription(text.slice(config[0].length)),
        builtin: true,
        node: comment,
      };
    }
  }

  if (additionalPattern !== null) {
    const extra = additionalPattern.exec(text);
    if (extra !== null) {
      return {
        kind: extra[0],
        prefix: null,
        disableKind: null,
        ...splitDescription(text.slice(extra[0].length)),
        builtin: false,
        node: comment,
      };
    }
  }

  return null;
}

/**
 * Splits what follows a directive label into its value and its description.
 *
 * Mirrors what Oxlint's Rust parser does (`crates/oxc_linter/src/disable_directives.rs`): the
 * description starts at the first `--`, or at a single `-` with whitespace on both sides. ESLint
 * only knows the `--` form, so a plugin that follows ESLint here would disagree with Oxlint about
 * which rule names a directive lists.
 */
function splitDescription(rest: string): { value: string; description: string | null } {
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] !== "-") {
      continue;
    }
    const next = rest[i + 1];
    const isSeparator = next === "-" || (isWhitespace(rest[i - 1]) && isWhitespace(next));
    if (!isSeparator) {
      continue;
    }
    let end = i;
    while (rest[end] === "-") {
      end++;
    }
    const description = rest.slice(end).trim();
    return { value: rest.slice(0, i).trim(), description: description === "" ? null : description };
  }
  return { value: rest.trim(), description: null };
}

function isWhitespace(char: string | undefined): boolean {
  return char !== undefined && /\s/u.test(char);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
