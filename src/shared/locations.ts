import type { Comment, Context, LineColumn, Location } from "@oxlint/plugins";

const LINE_PATTERN = /[^\r\n\u2028\u2029]*(?:\r\n|[\r\n\u2028\u2029]|$)/gu;

// `a` is at or before `b`.
export function lte(a: LineColumn, b: LineColumn): boolean {
  return a.line < b.line || (a.line === b.line && a.column <= b.column);
}

// True inside Oxlint, false when ESLint loads the plugin through `eslintCompatPlugin`.
export function isOxlint(context: Context): boolean {
  const { parser } = context.languageOptions as { parser?: { name?: unknown } };
  return parser?.name === "oxlint";
}

/**
 * Where to report a problem with a directive comment so the comment cannot silence its own report.
 *
 * Oxlint drops a diagnostic when its span overlaps a disabled interval, and a `disable` interval
 * starts at the end of the comment text, just before the closing delimiter. Reporting on the text
 * between the delimiters stays clear of every directive kind. ESLint only compares start positions,
 * so the upstream plugin's column -1 keeps working there. Oxlint rejects column -1 on line 1, which
 * is where most whole-file disables sit, so the two engines get different answers.
 */
export function forceLocation(context: Context, comment: Comment): Location {
  const { start, end } = comment.loc;
  if (isOxlint(context)) {
    return {
      start: { line: start.line, column: start.column + 2 },
      end: comment.type === "Block" ? { line: end.line, column: end.column - 2 } : end,
    };
  }
  return { start: { line: start.line, column: -1 }, end };
}

// The location of `ruleId` inside the comment, so the report points at the rule name itself.
export function ruleIdLocation(
  context: Context,
  comment: Comment,
  ruleId: string | null,
): Location {
  if (ruleId === null) {
    return forceLocation(context, comment);
  }
  const lines = comment.value.match(LINE_PATTERN) ?? [comment.value];
  const pattern = new RegExp(`([\\s,]|^)${escapeRegExp(ruleId)}(?=[\\s,]|$)`, "u");
  const { start } = comment.loc;

  for (let i = 0; i < lines.length; i++) {
    const match = pattern.exec(lines[i]);
    if (match === null) {
      continue;
    }
    // The first line of a comment's value sits after the two delimiter characters.
    const column = (i === 0 ? start.column + 2 : 0) + match.index + match[1].length;
    return {
      start: { line: start.line + i, column },
      end: { line: start.line + i, column: column + ruleId.length },
    };
  }
  return forceLocation(context, comment);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
