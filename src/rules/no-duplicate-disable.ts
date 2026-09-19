import { defineRule } from "@oxlint/plugins";
import { getDirectiveComments } from "../shared/directives.ts";
import { collectDisabledAreas } from "../shared/disabled-area.ts";
import { ruleIdLocation } from "../shared/locations.ts";

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Disallow disabling a rule that is already disabled.",
    },
    messages: {
      duplicate: "All rules are already disabled here by an earlier directive.",
      duplicateRule: "'{{ruleId}}' is already disabled here by an earlier directive.",
    },
    schema: [],
  },
  createOnce(context) {
    return {
      before() {
        return context.sourceCode.getAllComments().length > 0;
      },
      Program() {
        const { duplicateDisables } = collectDisabledAreas(
          getDirectiveComments(context.sourceCode),
        );
        for (const { directive, ruleId } of duplicateDisables) {
          context.report({
            loc: ruleIdLocation(context, directive.node, ruleId),
            messageId: ruleId === null ? "duplicate" : "duplicateRule",
            data: { ruleId: ruleId ?? "" },
          });
        }
      },
    };
  },
});
