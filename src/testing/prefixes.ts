import type { RuleTester } from "oxlint/plugins-dev";

type TestCase = RuleTester.ValidTestCase | RuleTester.InvalidTestCase | string;

// Only the disable family has an Oxlint spelling. `eslint`, `eslint-env`, `global`, `globals`, and
// `exported` stay as they are.
const ESLINT_DISABLE_FAMILY = /\beslint-(disable(?:-(?:next-)?line)?|enable)\b/gu;

/**
 * Runs every case twice: as written with `eslint-` directives, and again with the disable family
 * renamed to `oxlint-`. The rename applies to the code, the expected output, the options, and the
 * expected messages. Cases without an `eslint-` directive run once.
 */
export function withPrefixes<T extends TestCase>(cases: readonly T[]): T[] {
  return cases.flatMap((testCase) => {
    const renamed = rename(testCase);
    return JSON.stringify(renamed) === JSON.stringify(testCase) ? [testCase] : [testCase, renamed];
  });
}

function rename<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(ESLINT_DISABLE_FAMILY, "oxlint-$1") as T;
  }
  if (value instanceof RegExp) {
    return new RegExp(rename(value.source), value.flags) as T;
  }
  if (Array.isArray(value)) {
    return value.map(rename) as T;
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, rename(entry)]),
    ) as T;
  }
  return value;
}
