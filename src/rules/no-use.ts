import { defineRule } from "@oxlint/plugins";
import { getDirectiveComments } from "../shared/directives.ts";
import { forceLocation } from "../shared/locations.ts";

interface Options {
  allow?: string[];
  additionalDirectives?: string[];
}

export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow directive comments.",
    },
    messages: {
      disallow: "Directive comment '{{kind}}' is not allowed.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
          additionalDirectives: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
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
        const allowed = new Set(options.allow ?? []);
        const directives = getDirectiveComments(context.sourceCode, options.additionalDirectives);
        for (const directive of directives) {
          if (allowed.has(directive.kind)) {
            continue;
          }
          context.report({
            loc: forceLocation(context, directive.node),
            messageId: "disallow",
            data: { kind: directive.kind },
          });
        }
      },
    };
  },
});
