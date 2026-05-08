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
              group: ["**/application/**", "**/infrastructure/**", "**/presentation/**"],
              message:
                "Domain must not import from application, infrastructure, or presentation.",
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
              group: ["**/infrastructure/**", "**/presentation/**"],
              message: "Application must not import from infrastructure or presentation.",
            },
          ],
        },
      ],
    },
  }
);
