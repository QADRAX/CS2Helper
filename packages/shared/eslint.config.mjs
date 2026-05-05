import { baseConfig } from "../../eslint.config.mjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...baseConfig,
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/application/**", "**/infrastructure/**"],
              message:
                "Domain must not import from application or infrastructure.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/application/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/infrastructure/**"],
              message: "Application must not import from infrastructure.",
            },
          ],
        },
      ],
    },
  }
);
