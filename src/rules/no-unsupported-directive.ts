import { defineRule } from "@oxlint/plugins";
import { type ConfigKind, getDirectiveComments } from "../shared/directives.ts";
import { forceLocation } from "../shared/locations.ts";

const HINTS: Record<ConfigKind, string> = {
  eslint: "Configure the rule in your Oxlint config, or use an oxlint-disable comment.",
  "eslint-env": "Use the env option in your Oxlint config.",
  global: "Use the globals option in your Oxlint config.",
  globals: "Use the globals option in your Oxlint config.",
  exported: "Oxlint has no equivalent.",
};

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Disallow ESLint configuration comments that Oxlint ignores.",
    },
    messages: {
      unsupported: "Oxlint ignores '{{kind}}' comments. {{hint}}",
    },
    schema: [],
  },
  createOnce(context) {
    return {
      before() {
        return context.sourceCode.getAllComments().length > 0;
      },
      Program() {
        for (const directive of getDirectiveComments(context.sourceCode)) {
          if (directive.prefix !== null || !directive.builtin) {
            continue;
          }
          const kind = directive.kind as ConfigKind;
          context.report({
            loc: forceLocation(context, directive.node),
            messageId: "unsupported",
            data: { kind, hint: HINTS[kind] },
          });
        }
      },
    };
  },
});
