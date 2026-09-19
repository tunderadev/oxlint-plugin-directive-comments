import { eslintCompatPlugin } from "@oxlint/plugins";
import disableEnablePair from "./rules/disable-enable-pair.ts";
import noAggregatingEnable from "./rules/no-aggregating-enable.ts";
import noDuplicateDisable from "./rules/no-duplicate-disable.ts";
import noRestrictedDisable from "./rules/no-restricted-disable.ts";
import noUnlimitedDisable from "./rules/no-unlimited-disable.ts";
import noUnsupportedDirective from "./rules/no-unsupported-directive.ts";
import noUse from "./rules/no-use.ts";
import preferOxlintDirective from "./rules/prefer-oxlint-directive.ts";
import requireDescription from "./rules/require-description.ts";

// The short name people write in rule ids, as in "directive-comments/require-description".
export const name = "directive-comments";

export const rules = {
  // new-rule:start
  "disable-enable-pair": disableEnablePair,
  "no-aggregating-enable": noAggregatingEnable,
  "no-duplicate-disable": noDuplicateDisable,
  "no-restricted-disable": noRestrictedDisable,
  "no-unlimited-disable": noUnlimitedDisable,
  "no-unsupported-directive": noUnsupportedDirective,
  "no-use": noUse,
  "prefer-oxlint-directive": preferOxlintDirective,
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
      [`${name}/disable-enable-pair`]: "error",
      [`${name}/no-aggregating-enable`]: "error",
      [`${name}/no-duplicate-disable`]: "error",
      [`${name}/no-unlimited-disable`]: "error",
      [`${name}/no-unsupported-directive`]: "warn",
      // new-rule:recommended:end
    },
  },
};

export default plugin;
