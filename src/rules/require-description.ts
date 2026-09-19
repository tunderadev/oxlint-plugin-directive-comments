import { defineRule } from "@oxlint/plugins";

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Require a reason after -- on every directive comment.",
    },
    messages: {
      found: "TODO: write the message people will read in their editor.",
    },
    schema: [],
  },
  createOnce(context) {
    return {
      before() {
        // Return false to skip a file cheaply. JS plugins have no cache.
        return true;
      },
      // Replace with the node types this rule cares about.
      Identifier(node) {
        if (node.name === "TODO_REPLACE_ME") {
          context.report({ node, messageId: "found" });
        }
      },
    };
  },
});
