import { defineRule } from "@oxlint/plugins";
import ignore from "ignore";
import { getDirectiveComments } from "../shared/directives.ts";
import { collectDisabledAreas } from "../shared/disabled-area.ts";
import { forceLocation, ruleIdLocation } from "../shared/locations.ts";

export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow disable comments for the rules you name.",
    },
    messages: {
      disallow: "Disabling '{{ruleId}}' is not allowed.",
      disallowAll:
        "'{{kind}}' without rule names also disables restricted rules. Name the rules you mean.",
    },
    schema: {
      type: "array",
      items: { type: "string" },
      uniqueItems: true,
    },
  },
  createOnce(context) {
    return {
      before() {
        return context.options.length > 0 && context.sourceCode.getAllComments().length > 0;
      },
      Program() {
        const patterns = context.options as readonly string[];
        const restricted = ignore().add([...patterns]);
        const { areas } = collectDisabledAreas(getDirectiveComments(context.sourceCode));

        for (const { directive, ruleId } of areas) {
          if (ruleId === null) {
            context.report({
              loc: forceLocation(context, directive.node),
              messageId: "disallowAll",
              data: { kind: directive.kind },
            });
          } else if (restricted.ignores(ruleId)) {
            context.report({
              loc: ruleIdLocation(context, directive.node, ruleId),
              messageId: "disallow",
              data: { ruleId },
            });
          }
        }
      },
    };
  },
});
