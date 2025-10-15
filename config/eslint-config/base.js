import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
      "simple-import-sort": simpleImportSortPlugin,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Node.js built-in modules
            ["^node:"],
            // External packages (anything not starting with . or @/)
            ["^@?\\w"],
            // Internal packages (starting with @/)
            ["^@/"],
            // Parent imports (../)
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Other relative imports (same folder ./)
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // Style imports
            ["^.+\\.s?css$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  {
    ignores: [
      "dist/**",
      "**/generated/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/build/**",
    ],
  },
];
