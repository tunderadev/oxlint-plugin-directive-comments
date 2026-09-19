import { defineRule } from "@oxlint/plugins";
import { getDirectiveComments } from "../shared/directives.ts";
import { forceLocation } from "../shared/locations.ts";

export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow disable comments that do not name a rule.",
    },
    messages: {
      unexpected: "'{{kind}}' without rule names turns off every rule. Name the rules to disable.",
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
          if (
            directive.disableKind === null ||
            directive.disableKind === "enable" ||
            directive.value !== ""
          ) {
            continue;
          }
          context.report({
            loc: forceLocation(context, directive.node),
            messageId: "unexpected",
            data: { kind: directive.kind },
          });
        }
      },
    };
  },
});
