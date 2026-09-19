import { defineRule } from "@oxlint/plugins";
import { getDirectiveComments } from "../shared/directives.ts";
import { forceLocation } from "../shared/locations.ts";

export default defineRule({
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description: "Prefer the oxlint- spelling over eslint- in disable and enable comments.",
    },
    messages: {
      preferOxlint: "Use '{{replacement}}' rather than '{{kind}}'.",
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
          if (directive.prefix !== "eslint") {
            continue;
          }
          const { node } = directive;
          const replacement = directive.kind.replace(/^eslint-/u, "oxlint-");
          // The label follows the two delimiter characters and any leading whitespace.
          const labelStart = node.range[0] + 2 + node.value.indexOf(directive.kind);
          context.report({
            loc: forceLocation(context, node),
            messageId: "preferOxlint",
            data: { kind: directive.kind, replacement },
            fix: (fixer) =>
              fixer.replaceTextRange([labelStart, labelStart + "eslint".length], "oxlint"),
          });
        }
      },
    };
  },
});
