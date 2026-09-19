import { defineRule } from "@oxlint/plugins";
import { getDirectiveComments } from "../shared/directives.ts";
import { collectDisabledAreas } from "../shared/disabled-area.ts";
import { forceLocation } from "../shared/locations.ts";

export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow one enable comment that closes several disable comments.",
    },
    messages: {
      aggregatingEnable:
        "This '{{kind}}' closes {{count}} '{{disable}}' comments. Use one '{{kind}}' per '{{disable}}'.",
    },
    schema: [],
  },
  createOnce(context) {
    return {
      before() {
        return context.sourceCode.getAllComments().length > 0;
      },
      Program() {
        const { relatedDisableCounts } = collectDisabledAreas(
          getDirectiveComments(context.sourceCode),
        );
        for (const [directive, count] of relatedDisableCounts) {
          if (count < 2) {
            continue;
          }
          context.report({
            loc: forceLocation(context, directive.node),
            messageId: "aggregatingEnable",
            data: {
              kind: directive.kind,
              disable: `${directive.prefix}-disable`,
              count: String(count),
            },
          });
        }
      },
    };
  },
});
