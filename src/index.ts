import { eslintCompatPlugin } from "@oxlint/plugins";
import requireDescription from "./rules/require-description.ts";

// The short name people write in rule ids, as in "directive-comments/require-description".
export const name = "directive-comments";

export const rules = {
  // new-rule:start
  "require-description": requireDescription,
  // new-rule:end
};

const plugin = eslintCompatPlugin({
  meta: { name },
  rules,
});

export const configs = {
  recommended: {
    jsPlugins: ["oxlint-plugin-directive-comments"],
    rules: {
      // new-rule:recommended:start
      [`${name}/require-description`]: "error",
      // new-rule:recommended:end
    },
  },
};

export default plugin;
