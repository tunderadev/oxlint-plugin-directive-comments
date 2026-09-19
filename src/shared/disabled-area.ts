import type { LineColumn } from "@oxlint/plugins";
import { type DirectiveComment, splitRuleIds } from "./directives.ts";
import { lte } from "./locations.ts";

export type AreaKind = "block" | "line";

// A region of the file where one rule (or every rule, when `ruleId` is null) is disabled.
export interface DisabledArea {
  directive: DirectiveComment;
  ruleId: string | null;
  kind: AreaKind;
  start: LineColumn;
  end: LineColumn | null;
}

export interface RuleReference {
  directive: DirectiveComment;
  ruleId: string | null;
}

export interface DisabledAreas {
  areas: DisabledArea[];
  // Disable directives that named a rule which was already disabled at that point.
  duplicateDisables: RuleReference[];
  // Enable directives that closed nothing.
  unusedEnables: RuleReference[];
  // For each enable directive, how many disable directives it closed.
  relatedDisableCounts: Map<DirectiveComment, number>;
}

/**
 * Walks the disable and enable directives of one file and works out which areas they open and
 * close. A port of `disabled-area.js` from eslint-plugin-eslint-comments.
 */
export function collectDisabledAreas(directives: readonly DirectiveComment[]): DisabledAreas {
  const areas: DisabledArea[] = [];
  const duplicateDisables: RuleReference[] = [];
  const unusedEnables: RuleReference[] = [];
  const relatedDisableCounts = new Map<DirectiveComment, number>();

  const findArea = (ruleId: string | null, location: LineColumn): DisabledArea | null => {
    for (let i = areas.length - 1; i >= 0; i--) {
      const area = areas[i];
      if (
        (area.ruleId === null || area.ruleId === ruleId) &&
        lte(area.start, location) &&
        (area.end === null || lte(location, area.end))
      ) {
        return area;
      }
    }
    return null;
  };

  const disable = (
    directive: DirectiveComment,
    start: LineColumn,
    ruleIds: string[] | null,
    kind: AreaKind,
  ): void => {
    for (const ruleId of ruleIds ?? [null]) {
      if (findArea(ruleId, start) !== null) {
        duplicateDisables.push({ directive, ruleId });
      }
      areas.push({ directive, ruleId, kind, start, end: null });
    }
  };

  const enable = (
    directive: DirectiveComment,
    end: LineColumn,
    ruleIds: string[] | null,
    kind: AreaKind,
  ): void => {
    const related = new Set<DirectiveComment>();
    for (const ruleId of ruleIds ?? [null]) {
      let used = false;
      for (let i = areas.length - 1; i >= 0; i--) {
        const area = areas[i];
        if (
          area.end === null &&
          area.kind === kind &&
          (ruleId === null || area.ruleId === ruleId)
        ) {
          related.add(area.directive);
          area.end = end;
          used = true;
        }
      }
      if (!used) {
        unusedEnables.push({ directive, ruleId });
      }
    }
    relatedDisableCounts.set(directive, related.size);
  };

  for (const directive of directives) {
    if (directive.disableKind === null) {
      continue;
    }
    const ruleIds = splitRuleIds(directive.value);
    const { line } = directive.node.loc.start;
    switch (directive.disableKind) {
      case "disable":
        disable(directive, directive.node.loc.start, ruleIds, "block");
        break;
      case "enable":
        enable(directive, directive.node.loc.start, ruleIds, "block");
        break;
      case "disable-line":
        disable(directive, { line, column: 0 }, ruleIds, "line");
        enable(directive, { line: line + 1, column: -1 }, ruleIds, "line");
        break;
      case "disable-next-line":
        disable(directive, { line: line + 1, column: 0 }, ruleIds, "line");
        enable(directive, { line: line + 2, column: -1 }, ruleIds, "line");
        break;
    }
  }

  return { areas, duplicateDisables, unusedEnables, relatedDisableCounts };
}
