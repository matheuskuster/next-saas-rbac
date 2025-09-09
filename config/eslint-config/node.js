import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use Node.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nodeJsConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
]