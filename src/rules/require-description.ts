import { defineRule } from "@oxlint/plugins";
import { BUILTIN_KINDS, getDirectiveComments } from "../shared/directives.ts";
import { forceLocation } from "../shared/locations.ts";

interface Options {
  ignore?: string[];
  additionalDirectives?: string[];
}

export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Require a description after `--` on every directive comment.",
    },
    messages: {
      missingDescription:
        "Missing description on '{{kind}}'. Add ' -- <reason>' to say why the directive is needed.",
    },
    schema: [
      {
        type: "object",
        properties: {
          ignore: {
            type: "array",
            items: { type: "string", enum: [...BUILTIN_KINDS] },
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
        const ignore = new Set(options.ignore ?? []);
        const directives = getDirectiveComments(context.sourceCode, options.additionalDirectives);
        for (const directive of directives) {
          if (directive.description !== null || ignore.has(directive.kind)) {
            continue;
          }
          context.report({
            loc: forceLocation(context, directive.node),
            messageId: "missingDescription",
            data: { kind: directive.kind },
          });
        }
      },
    };
  },
});
