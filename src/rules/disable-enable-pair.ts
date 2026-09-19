import { defineRule } from "@oxlint/plugins";
import { getDirectiveComments } from "../shared/directives.ts";
import { collectDisabledAreas } from "../shared/disabled-area.ts";
import { lte, ruleIdLocation } from "../shared/locations.ts";

interface Options {
  allowWholeFile?: boolean;
}

export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Require an enable comment for every disable comment.",
    },
    messages: {
      missingPair:
        "Missing '{{enable}}' for this '{{kind}}'. Every rule stays off until the end of the file.",
      missingRulePair:
        "Missing '{{enable}} {{ruleId}}' for this '{{kind}}'. The rule stays off until the end of the file.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allowWholeFile: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  createOnce(context) {
    return {
      before() {
        return context.sourceCode.getAllComments().length > 0;
      },
      Program() {
        const options = (context.options[0] ?? {}) as Options;
        const { areas } = collectDisabledAreas(getDirectiveComments(context.sourceCode));

        // With allowWholeFile, a disable that comes before any code may stay open.
        const firstStatement = context.sourceCode.ast.body[0];
        if (options.allowWholeFile === true && firstStatement === undefined) {
          return;
        }

        for (const area of areas) {
          if (area.end !== null) {
            continue;
          }
          if (
            options.allowWholeFile === true &&
            firstStatement !== undefined &&
            lte(area.start, firstStatement.loc.start)
          ) {
            continue;
          }
          const { directive } = area;
          context.report({
            loc: ruleIdLocation(context, directive.node, area.ruleId),
            messageId: area.ruleId === null ? "missingPair" : "missingRulePair",
            data: {
              kind: directive.kind,
              enable: `${directive.prefix}-enable`,
              ruleId: area.ruleId ?? "",
            },
          });
        }
      },
    };
  },
});
